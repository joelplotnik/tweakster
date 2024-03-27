class Api::V1::UsersController < ApplicationController
  include Userable
  include Pieceable

  load_and_authorize_resource
  before_action :authenticate_user!, only: [:update, :destroy, :most_interacted_channels, :most_interacted_users, :update_favorite_users, :update_favorite_users, :subscriptions, :following, :check_ownership]

  rescue_from CanCan::AccessDenied do |exception|
    render json: { warning: exception }, status: :unauthorized
  end

  def index
    users = User.paginate(page: params[:page], per_page: 25).order(created_at: :asc).map do |user|
      { id: user.id, username: user.username, piece_count: user.pieces.count, avatar_url: user.avatar_url, }
    end
    render json: users
  end

  def popular
    limit = params[:limit] || 10 
    
    users = User.includes(:pieces => [:votes, :comments]).all
    
    user_popularity_scores = Hash.new(0)
    
    users.each do |user|
      score = 0
      user.pieces.each do |piece|
        score += piece.comments.where("created_at >= ?", Date.today).count
        score += piece.votes.where("created_at >= ?", Date.today).count
      end
      user_popularity_scores[user] = score
    end
    
    sorted_users = user_popularity_scores.sort_by { |_, score| score }.reverse
    
    top_users = []
    
    sorted_users.each do |user, _|
      top_users << {
        id: user.id,
        username: user.username,
        piece_count: user.pieces.count,
        avatar_url: user.avatar_url
      }
      break if top_users.size == limit.to_i
    end
    
    if top_users.size < limit.to_i
      remaining_users = User.limit(limit.to_i - top_users.size).order(follower_count: :desc)
      remaining_users.each do |user|
        top_users << {
          id: user.id,
          username: user.username,
          piece_count: user.pieces.count,
          avatar_url: user.avatar_url
        }
      end
    end
    
    render json: top_users
  end
  

  def search
    search_term = params[:search_term].downcase.strip 
    users = User.where('LOWER(username) LIKE ?', "#{search_term}%")
  
    users = users
      .paginate(page: params[:page], per_page: 5)
      .order(created_at: :asc)
      .map do |user|
        {
          id: user.id,
          username: user.username,
          avatar_url: user.avatar_url,
          piece_count: user.pieces.count,
        }
      end
  
    render json: users
  end
  
  def show
    user = User.find(params[:id])
    page = params[:page] || 1
    per_page = params[:per_page] || 10
    pieces = user.pieces.includes(:channel, :votes)
    
    pieces_info = pieces.paginate(page: page, per_page: per_page).order(created_at: :desc).map do |piece|
      image_urls = piece.images.map { |image| url_for(image) }

      parent_piece_info = get_parent_piece_info(piece.parent_piece_id)

      highest_scoring_tweak_info = get_highest_scoring_tweak_piece(piece)
   
      piece_json = piece.as_json(only: [:id, :title, :parent_piece_id, :content, :created_at, :likes, :dislikes, :channel_id, 
        :comments_count, :tweaks_count, :youtube_url],
                                 include: {
                                    user: { only: [:id, :username], methods: [:avatar_url]},
                                    channel: { only: [:id, :name] },
                                    votes: { only: [:user_id, :vote_type] }
                                 })
  
      piece_json['images'] = image_urls
      piece_json['parent_piece'] = parent_piece_info

      piece_json.merge!(tweak: highest_scoring_tweak_info) if highest_scoring_tweak_info.present?
  
      piece_json
    end
  
    user_data = {
      id: user.id,
      username: user.username,
      email: user.email,
      url: user.url,
      bio: user.bio,
      integrity: user.integrity,
      avatar_url: user.avatar_url,
      follower_count: user.following_users.count,
      favorite_users: [],
      favorite_channels: [],
      pieces: pieces_info,
      piece_count: pieces.count
    }

    user_data[:favorite_users] = user.favorite_users.map do |favorite_user_id|
      favorite_user = User.find_by(id: favorite_user_id)
      if favorite_user
        {
          id: favorite_user.id,
          username: favorite_user.username,
          avatar_url: favorite_user.avatar_url
        }
      else
        nil
      end
    end.compact

    user_data[:favorite_channels] = user.favorite_channels.map do |favorite_channel_id|
      favorite_channel = Channel.find_by(id: favorite_channel_id)
      if favorite_channel
        {
          id: favorite_channel.id,
          name: favorite_channel.name,
          visual_url: favorite_channel.visual_url
        }
      else
        nil
      end
    end.compact

    if current_user
      user_data['can_edit'] = current_user.id == user.id || current_user.admin?
      user_data['following'] = current_user.followees.exists?(user.id)
    end

    render json: user_data

  end  

  def update
    user = User.find(params[:id])
  
    if current_user.admin?
      if params[:user][:avatar].present?
        user.avatar.attach(params[:user][:avatar])
      elsif params[:user][:remove_avatar] == 'true' 
        user.avatar.purge
      end
  
      if params[:user][:new_password].present?
        if user.update(password: params[:user][:new_password])
          render_updated_user(user)
        else
          render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
        end
      else
        if user.update(user_params.except(:password, :new_password))
          render_updated_user(user)
        else
          render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
        end
      end
    else
      if user.valid_password?(params[:user][:password])
        if params[:user][:avatar].present?
          user.avatar.attach(params[:user][:avatar])
        elsif params[:user][:remove_avatar] == 'true' 
          user.avatar.purge
        end
    
        if params[:user][:new_password].present?
          if user.update(password: params[:user][:new_password])
            render_updated_user(user)
          else
            render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
          end
        else
          if user.update(user_params.except(:password, :new_password))
            render_updated_user(user)
          else
            render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
          end
        end
      else
        render json: { error: 'Invalid password' }, status: :unauthorized
      end
    end
  end

  def most_interacted_channels
    user = User.find(params[:id])
  
    if !current_user.admin? && current_user != user
      render json: { error: "Unauthorized" }, status: :unauthorized
      return
    end
  
    subscribed_channels = user.subscriptions.includes(channel: { pieces: [:comments, :votes] })
    
    channel_interaction_counts = {}
  
    subscribed_channels.each do |subscription|
      channel = subscription.channel
      interaction_count = 0
  
      channel.pieces.each do |piece|
        interaction_count += piece.comments.where(user_id: user.id).count
        interaction_count += piece.votes.where(user_id: user.id, vote_type: 'upvote').count
      end
  
      channel_interaction_counts[channel] = interaction_count
    end
    
    sorted_channels = channel_interaction_counts.sort_by { |_, count| count }.reverse.map do |channel, _|
      {
        id: channel.id,
        name: channel.name,
        subscriptions_count: channel.subscriptions_count,
        visual_url: channel.visual_url,
        interactions_count: channel_interaction_counts[channel]
      }
    end
  
    top_5_channels = sorted_channels.slice(0, 5)
    
    render json: top_5_channels
  end

  def subscriptions
    user = User.find(params[:id])
  
    if !current_user.admin? && current_user != user
      render json: { error: "Unauthorized" }, status: :unauthorized
      return
    end
  
    page = params[:page] || 1
    per_page = params[:per_page] || 10
  
    subscriptions = user.subscriptions.includes(channel: :pieces)
                                      .order(created_at: :desc)
                                      .paginate(page: page, per_page: per_page)
  
    subscribed_channels = subscriptions.map do |subscription|
      channel = subscription.channel
      {
        id: channel.id,
        name: channel.name,
        visual_url: channel.visual_url
      }
    end
  
    render json: subscribed_channels
  end

  def update_favorite_channels
    user = User.find_by(id: params[:id])
  
    if !current_user.admin? && current_user != user
      render json: { error: "Unauthorized" }, status: :unauthorized
      return
    end
    
    if user.present?
      request_body = JSON.parse(request.body.read)
      new_favorite_channels = request_body["favorite_channels"]
  
      new_favorite_channels ||= []
  
      new_favorite_channels = new_favorite_channels.uniq.reject { |id| id.blank? || !Channel.exists?(id: id) }
      
      if new_favorite_channels.empty?
        user.favorite_channels = []
      else
        new_favorite_channels = new_favorite_channels.select { |id| user.subscriptions.exists?(channel_id: id) }
        user.favorite_channels = new_favorite_channels
      end
  
      if user.save
        favorite_channels = user.favorite_channels.map do |favorite_channel_id|
          favorite_channel = Channel.find_by(id: favorite_channel_id)
          if favorite_channel
            {
              id: favorite_channel.id,
              name: favorite_channel.name,
              visual_url: favorite_channel.visual_url
            }
          else
            nil
          end
        end.compact
  
        render json: { favorite_channels: favorite_channels }, status: :ok
      else
        render json: { error: "Failed to update favorite channels" }, status: :unprocessable_entity
      end
    else
      render json: { error: "User not found" }, status: :not_found
    end
  end
  

  def most_interacted_users
    user = User.find(params[:id])
  
    if !current_user.admin? && current_user != user
      render json: { error: "Unauthorized" }, status: :unauthorized
      return
    end
  
    followee_ids = user.followees.pluck(:id)
  
    commented_piece_ids = user.comments.pluck(:piece_id)
    voted_piece_ids = user.votes.where(vote_type: 'upvote').pluck(:votable_id)
    interacted_piece_ids = (commented_piece_ids + voted_piece_ids).uniq
  
    interacted_users = User.joins(pieces: :user)
                            .where(pieces: { id: interacted_piece_ids })
                            .where(users: { id: followee_ids })
                            .distinct

    if interacted_users.empty?
      most_recently_followed_users = user.followees.order('relationships.created_at DESC').limit(5)
      response_data = most_recently_followed_users.map do |u|
        {
          id: u.id,
          username: u.username,
          piece_count: u.pieces.count,
          avatar_url: u.avatar_url
        }
      end
      render json: response_data
      return
    end
  
    interacted_users = interacted_users.sort_by do |u|
      latest_interaction_date = u.pieces.where(id: interacted_piece_ids).maximum(:created_at)
      latest_interaction_date || u.created_at
    end.reverse
  
    interacted_users.reject! { |u| u.id == user.id }
  
    top_5_users = interacted_users.take(5)
  
    response_data = top_5_users.map do |u|
      {
        id: u.id,
        username: u.username,
        piece_count: u.pieces.count,
        avatar_url: u.avatar_url
      }
    end
  
    render json: response_data
  end

  def following
    user = User.find(params[:id])
  
    if !current_user.admin? && current_user != user
      render json: { error: "Unauthorized" }, status: :unauthorized
      return
    end
  
    page = params[:page] || 1
    per_page = params[:per_page] || 10
  
    followees = user.followees.order('relationships.created_at DESC')
                               .paginate(page: page, per_page: per_page)
  
    followees_data = followees.map do |followee|
      {
        id: followee.id,
        username: followee.username,
        avatar_url: followee.avatar_url
      }
    end
  
    render json: followees_data
  end

  def update_favorite_users
    user = User.find_by(id: params[:id])
  
    if !current_user.admin? && current_user != user
      render json: { error: "Unauthorized" }, status: :unauthorized
      return
    end
  
    if user.present?
      request_body = JSON.parse(request.body.read)
      new_favorite_users = request_body["favorite_users"]
  
      new_favorite_users ||= []
  
      new_favorite_users = new_favorite_users.uniq.reject { |id| id.blank? || !User.exists?(id: id) }
  
      new_favorite_users = new_favorite_users.select { |id| user.followees.exists?(id: id) }
  
      user.favorite_users = new_favorite_users
  
      if user.save
        favorite_users = user.favorite_users.map do |favorite_user_id|
          favorite_user = User.find_by(id: favorite_user_id)
          if favorite_user
            {
              id: favorite_user.id,
              username: favorite_user.username,
              avatar_url: favorite_user.avatar_url
            }
          else
            nil
          end
        end.compact
  
        render json: { favorite_users: favorite_users }, status: :ok
      else
        render json: { error: "Failed to update favorite users" }, status: :unprocessable_entity
      end
    else
      render json: { error: "User not found" }, status: :not_found
    end
  end
  
  def destroy
    user = User.find(params[:id])
  
    if user.destroy
      sign_out if !user.admin? || user == current_user
      render json: { message: 'User deleted successfully' }
    else
      render json: { error: 'Unauthorized' }, status: :unauthorized
    end
  end

  def check_ownership
    user = User.find(params[:id])
    belongs_to_user = user == current_user || current_user.admin?
    render json: { belongs_to_user: belongs_to_user }
  end

  private

  def user_params
    params.require(:user).permit(:avatar, :username, :email, :url, :bio, :password, :new_password, :favorite_users)
  end 

  def render_updated_user(user)
    user_serializer = UserSerializer.new(user).serializable_hash[:data][:attributes]
    render json: user_serializer, status: :ok
  end
end