class Api::V1::UsersController < ApplicationController
  include Userable
  include Pieceable

  load_and_authorize_resource
  before_action :authenticate_user!, only: [:update, :destroy, :check_ownership]

  rescue_from CanCan::AccessDenied do |exception|
    render json: { warning: exception }, status: :unauthorized
  end

  def index
    users = User.paginate(page: params[:page], per_page: 25).order(created_at: :asc).map do |user|
      { id: user.id, username: user.username, piece_count: user.pieces.count, avatar_url: user.avatar_url, }
    end
    render json: users
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
  
    if user.valid_password?(params[:user][:password])
      if params[:user][:avatar].present?
        user.avatar.attach(params[:user][:avatar])
      elsif params[:user][:remove_avatar] == 'true' 
        user.avatar.purge
      end
  
      if params[:user][:new_password].present?
        if user.update(password: params[:user][:new_password])
          render json: user, status: :ok
        else
          render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
        end
      else
        if user.update(user_params)
          user_serializer = UserSerializer.new(user).serializable_hash[:data][:attributes]
          render json: user_serializer, status: :ok
        else
          render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
        end
      end
    else
      render json: { error: 'Invalid password' }, status: :unauthorized
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
    params.require(:user).permit(:avatar, :username, :email, :url, :bio, :password, :new_password)
  end 
end