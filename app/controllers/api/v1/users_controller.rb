class Api::V1::UsersController < ApplicationController
  before_action :authenticate_user!, only: [:update, :destroy, :check_ownership]

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
    pieces = user.pieces.paginate(page: page, per_page: per_page).order(created_at: :desc)
    render json: {
      user: user,
      pieces: pieces.as_json(only: [:id, :title, :content, :created_at])
    }
  end

  def update
    user = User.find(params[:id])

    puts "*************************************************"
    puts "This is the current user: #{current_user.inspect}"
    puts "*************************************************"

    if user == current_user 
      if user.update(user_params)
        render json: user, status: :ok
      else
        render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
      end
    else
      render json: { error: 'Unauthorized' }, status: :unauthorized
    end
  end

  def destroy
    user = User.find(params[:id])

    if user == current_user
      sign_out
      user.destroy
      render json: { message: 'User deleted successfully' }
    else
      render json: { error: 'Unauthorized' }, status: :unauthorized
    end
  end

  def check_ownership
    user = User.find(params[:id])
    belongs_to_user = user == current_user
    render json: { belongs_to_user: belongs_to_user }
  end

  private

  def user_params
    params.require(:user).permit(:username, :email, :password)
  end 
end