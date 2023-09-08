class Api::V1::UsersController < ApplicationController
  include Userable

  load_and_authorize_resource
  before_action :authenticate_user!, only: [:update, :destroy, :check_ownership]
  before_action :require_admin!, only: [:impersonate, :stop_impersonating]

  rescue_from CanCan::AccessDenied do |exception|
    render json: { warning: exception }, status: :unauthorized
  end

  def index
    users = User.paginate(page: params[:page], per_page: 25).order(created_at: :asc).map do |user|
      { id: user.id, username: user.username, piece_count: user.pieces.count, avatar_url: user.avatar_url, }
    end
    render json: users
  end

  def show
    user = User.find(params[:id])
    page = params[:page] || 1
    per_page = params[:per_page] || 5
    pieces = user.pieces.includes(:channel, :votes)
                     .paginate(page: page, per_page: per_page)
                     .order(created_at: :desc)
                     .as_json(only: [:id, :title, :content, :created_at, :likes, :dislikes, :channel_id, :comments_count, :tweaks_count],
                              include: {
                                channel: { only: [:id, :name] },
                                votes: { only: [:user_id, :vote_type] }
                              })

    render json: {
      id: user.id,
      username: user.username,
      email: user.email,
      purity: user.purity,
      avatar_url: user.avatar_url,
      pieces: pieces
    }
  end

  def update
    user = User.find(params[:id])
  
    if params[:user][:avatar].present?
      user.avatar.attach(params[:user][:avatar])
    end
  
    if params[:user][:new_password].present? 
      if user.valid_password?(params[:user][:password]) 
        if user.update(password: params[:user][:new_password]) 
          render json: user, status: :ok
        else
          render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
        end
      else
        render json: { error: 'Invalid password' }, status: :unauthorized
      end
    else
      if user.update(user_params) 
        user_serializer = UserSerializer.new(@user).serializable_hash[:data][:attributes]
        render json: user_serializer, status: :ok
      else
        render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
      end
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

  def impersonate
    user = User.find(params[:id])
    if impersonate_user(user)
      user_to_render = user.as_json.merge(avatar_url: user.avatar_url)
      render json: { message: "Impersonating #{user.username}", user: user_to_render }, status: :ok
    else
      render json: { error: "Failed to start impersonation." }, status: :unprocessable_entity
    end
  end

  def stop_impersonating
    if stop_impersonating_user
      user_to_render = current_user.as_json.merge(avatar_url: current_user.avatar_url)
      render json: { message: "Impersonating stopped successfully. Back to #{current_user.username}", user: user_to_render }, status: :ok
    else
      render json: { error: "Failed to stop impersonation." }, status: :unprocessable_entity
    end
  end

  private

  def user_params
    params.require(:user).permit(:avatar, :username, :email, :password, :new_password)
  end 

  def require_admin!
    unless true_user.admin?
      render json: { error: "You are not authorized to impersonate." }, status: :forbidden
    end
  end
end