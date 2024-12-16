class Api::V1::UsersController < ApplicationController
  skip_before_action :verify_authenticity_token, raise: false
  before_action :authenticate_devise_api_token!, only: %i[me]
  before_action :set_user, only: %i[show update destroy attempts following popular_users check_ownership]

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

  def show
    render json: format_user(@user).merge({
                                            currently_playing: @user.currently_playing_game
                                          })
  end

  def update
    if current_user.admin?
      if params[:user][:avatar].present?
        @user.avatar.attach(params[:user][:avatar])
      elsif params[:user][:remove_avatar] == 'true'
        @user.reset_avatar_to_default
      end

      if params[:user][:new_password].present?
        if @user.update(password: params[:user][:new_password])
          render_updated_user(@user)
        else
          render json: { errors: @user.errors.full_messages }, status: :unprocessable_entity
        end
      elsif @user.update(user_params.except(:password, :new_password))
        render_updated_user(@user)
      else
        render json: { errors: @user.errors.full_messages }, status: :unprocessable_entity
      end
    elsif @user.valid_password?(params[:user][:password])
      if params[:user][:avatar].present?
        @user.avatar.attach(params[:user][:avatar])
      elsif params[:user][:remove_avatar] == 'true'
        @user.reset_avatar_to_default
      end

      if params[:user][:new_password].present?
        if @user.update(password: params[:user][:new_password])
          render_updated_user(@user)
        else
          render json: { errors: @user.errors.full_messages }, status: :unprocessable_entity
        end
      elsif @user.update(user_params.except(:password, :new_password))
        render_updated_user(@user)
      else
        render json: { errors: @user.errors.full_messages }, status: :unprocessable_entity
      end
    else
      render json: { error: 'Invalid password' }, status: :unauthorized
    end
  end

  def destroy
    if @user.destroy
      sign_out if !@user.admin? || @user == current_user
      render json: { message: 'User deleted successfully' }
    else
      render json: { error: 'Unauthorized' }, status: :unauthorized
    end
  end

  def me
    devise_api_token = current_devise_api_token
    if devise_api_token && (user = devise_api_token.resource_owner)
      render json: format_user(user), status: :ok
    else
      render json: { error: 'User not authenticated' }, status: :unauthorized
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

  def attempts
    limit = params[:limit] || 25
    page = params[:page] || 1

    return render json: { error: 'User must be specified' }, status: :unprocessable_entity unless @user

    attempts = @user.attempts
                    .includes(:challenge, challenge: :game)
                    .paginate(page:, per_page: limit)

    render json: {
      attempts: attempts.map { |attempt| format_attempt(attempt) },
      current_page: page.to_i,
      total_pages: attempts.total_pages,
      total_attempts: attempts.total_entries
    }
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

  def following
    if !current_user.admin? && current_user != @user
      render json: { error: 'Unauthorized' }, status: :unauthorized
      return
    end

    page = params[:page] || 1
    per_page = params[:per_page] || 10

    followees = @user.followees.order('relationships.created_at DESC')
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
    belongs_to_user = @user == current_user || current_user.admin?
    render json: { belongs_to_user: }
  end

  private

  def user_params
    params.require(:user).permit(:avatar, :username, :email, :url, :bio, :password, :new_password, :favorite_users)
  end

  def set_user
    @user = User.friendly.find(params[:id]) if params[:id]
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

  def format_attempt(attempt)
    attempt.as_json(
      include: {
        challenge: {
          include: :game,
          methods: [:difficulty_rating]
        },
        user: {
          only: %i[username slug],
          methods: [:avatar_url]
        }
      },
      methods: %i[comments_count approvals_count]
    )
  end
end
