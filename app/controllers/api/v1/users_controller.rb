class Api::V1::UsersController < ApplicationController
  before_action :doorkeeper_authorize!, only: %i[update destroy following check_ownership]
  before_action :current_user

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
                    .joins(accepted_challenges: :approvals)
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
        user.avatar.purge
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
        user.avatar.purge
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

  def update_favorite_games
    user = User.find_by(id: params[:id])

    if !current_user.admin? && current_user != user
      render json: { error: 'Unauthorized' }, status: :unauthorized
      return
    end

    if user.present?
      request_body = JSON.parse(request.body.read)
      new_favorite_games = request_body['favorite_games']

      new_favorite_games ||= []

      new_favorite_games = new_favorite_games.uniq.reject { |id| id.blank? || !Game.exists?(id:) }

      if new_favorite_games.empty?
        user.favorite_games = []
      else
        new_favorite_games = new_favorite_games.select { |id| user.games.exists?(id:) }
        user.favorite_games = new_favorite_games
      end

      if user.save
        favorite_games = user.favorite_games.map do |favorite_game_id|
          favorite_game = Game.find_by(id: favorite_game_id)
          next unless favorite_game

          {
            id: favorite_game.id,
            name: favorite_game.name,
            image_url: favorite_game.image_url
          }
        end.compact

        render json: { favorite_games: }, status: :ok
      else
        render json: { error: 'Failed to update favorite games' }, status: :unprocessable_entity
      end
    else
      render json: { error: 'User not found' }, status: :not_found
    end
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
