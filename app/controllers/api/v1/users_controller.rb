class Api::V1::UsersController < ApplicationController
  include Userable
  include Pieceable

  load_and_authorize_resource
  before_action :authenticate_user!, only: [:update, :destroy, :top_subscribed_channels, :top_followed_users, :check_ownership]

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
      break if top_users.size == 10
    end
  
    if top_users.size < 10
      remaining_users = User.limit(10 - top_users.size).order(follower_count: :desc)
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

    subscriptions = user.subscriptions.order(created_at: :desc).limit(5)
    followees = user.followees.order('relationships.created_at DESC').limit(5)

    subscriptions_info = subscriptions.map do |subscription|
      {
        id: subscription.id,
        channel_id: subscription.channel_id,
        channel_name: subscription.channel&.name,
        visual_url: subscription.channel&.visual_url
      }
    end
    
    
    followees_info = followees.map do |followee|
      {
        id: followee.id,
        username: followee.username,
        avatar_url: followee.avatar_url,
      }
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
      followees: followees_info,
      subscriptions: subscriptions_info,
      pieces: pieces_info,
      piece_count: pieces.count
    }
  
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

  def top_subscribed_channels
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
  

  def top_followed_users
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
    params.require(:user).permit(:avatar, :username, :email, :url, :bio, :password, :new_password)
  end 

  def render_updated_user(user)
    user_serializer = UserSerializer.new(user).serializable_hash[:data][:attributes]
    render json: user_serializer, status: :ok
  end
end