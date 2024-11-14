class Api::V1::UsersController < ApplicationController
  before_action :doorkeeper_authorize!, only: %i[me update destroy following check_ownership]
  before_action :current_user

  def show_current_user
    if current_user
      render json: {
        id: current_user.id,
        email: current_user.email,
        username: current_user.username,
        avatar_url: current_user.avatar_url,
        role: current_user.role
      }
    else
      render json: { error: 'User not found' }, status: :not_found
    end
  end

  def index
    limit = params[:limit] || 25
    page = params[:page] || 1

    users = User
            .with_attached_avatar
            .paginate(page:, per_page: limit)
            .order(created_at: :asc)
            .map { |user| format_user(user) }

    render json: users
  end

  def popular_users
    limit = params[:limit] || 5
    page = params[:page] || 1
    point_in_time = params[:point_in_time] || Time.current

    popular_users = User
                    .with_attached_avatar
                    .joins(attempts: :approvals)
                    .where('approvals.created_at >= ? AND approvals.created_at <= ?', 7.days.ago, point_in_time)
                    .group('users.id')
                    .order('COUNT(approvals.id) DESC')
                    .paginate(page:, per_page: limit)
                    .select('users.*, COUNT(approvals.id) AS approvals_count')
                    .map { |user| format_user(user) }

    render json: { users: popular_users, point_in_time: }, status: :ok
  end

  def show
    user = User.find(params[:id])
    render json: format_user(user)
  end

  def update
    user = User.find(params[:id])

    if current_user.admin?
      if params[:user][:avatar].present?
        user.avatar.attach(params[:user][:avatar])
      elsif params[:user][:remove_avatar] == 'true'
        user.reset_avatar_to_default
      end

      if params[:user][:new_password].present?
        if user.update(password: params[:user][:new_password])
          render_updated_user(user)
        else
          render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
        end
      elsif user.update(user_params.except(:password, :new_password))
        render_updated_user(user)
      else
        render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
      end
    elsif user.valid_password?(params[:user][:password])
      if params[:user][:avatar].present?
        user.avatar.attach(params[:user][:avatar])
      elsif params[:user][:remove_avatar] == 'true'
        user.reset_avatar_to_default
      end

      if params[:user][:new_password].present?
        if user.update(password: params[:user][:new_password])
          render_updated_user(user)
        else
          render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
        end
      elsif user.update(user_params.except(:password, :new_password))
        render_updated_user(user)
      else
        render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
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
        avatar_url: user.avatar_url
      }
    end

    render json: users
  end

  def following
    user = User.find(params[:id])

    if !current_user.admin? && current_user != user
      render json: { error: 'Unauthorized' }, status: :unauthorized
      return
    end

    page = params[:page] || 1
    per_page = params[:per_page] || 10

    followees = user.followees.order('relationships.created_at DESC')
                    .paginate(page:, per_page:)

    followees_data = followees.map do |followee|
      {
        id: followee.id,
        username: followee.username,
        avatar_url: followee.avatar_url
      }
    end

    render json: followees_data
  end

  def check_ownership
    user = User.find(params[:id])
    belongs_to_user = user == current_user || current_user.admin?
    render json: { belongs_to_user: }
  end

  private

  def user_params
    params.require(:user).permit(:avatar, :username, :email, :url, :bio, :password, :new_password, :favorite_users)
  end

  def render_updated_user(user)
    user_serializer = UserSerializer.new(user).serializable_hash[:data][:attributes]
    render json: user_serializer, status: :ok
  end

  def format_user(user)
    user.as_json.merge({
                         avatar_url: user.avatar_url
                       })
  end
end
