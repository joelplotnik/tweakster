class Api::V1::UsersController < ApplicationController
  load_and_authorize_resource
  before_action :authenticate_user!, only: [:update, :destroy, :check_ownership]

  rescue_from CanCan::AccessDenied do |exception|
    render json: { warning: exception }, status: :unauthorized
  end

  def index
    users = User.paginate(page: params[:page], per_page: 10).order(created_at: :asc).map do |user|
      { id: user.id, username: user.username, piece_count: user.pieces.count }
    end
    render json: users
  end

  def show
    user = User.find(params[:id])
    page = params[:page] || 1
    per_page = params[:per_page] || 5
    pieces = user.pieces.includes(:channel).paginate(page: page, per_page: per_page).order(created_at: :desc)
    render json: {
      id: user.id,
      username: user.username,
      email: user.email,
      pieces: pieces.as_json(only: [:id, :title, :content, :created_at], include: { channel: { only: [:id, :name] } })
    }
  end  

  def update
    user = User.find(params[:id])
  
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
        render json: user, status: :ok
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

  private

  def user_params
    params.require(:user).permit(:username, :email, :password, :new_password)
  end 
end