class Api::V1::UsersController < ApplicationController
  skip_before_action :verify_authenticity_token, raise: false
  before_action :authenticate_devise_api_token!, only: %i[me update destroy]
  before_action :authenticate_devise_api_token_if_present!, only: %i[show attempts]
  before_action :set_user, only: %i[show update destroy attempts following popular_users]

  def index
    users = User.with_attached_avatar
                .order(created_at: :asc)

    paginated_users = users.paginate(page: params[:page], per_page: 10)

    users_with_metadata = paginated_users.map { |user| format_user(user) }

    render json: users_with_metadata
  end

  def show
    is_owner = current_user.present? && current_user == @user
    is_following = current_user.present? && current_user.following?(@user)

    render json: format_user(@user).merge({
                                            currently_playing: @user.currently_playing_game,
                                            is_owner:,
                                            is_following:
                                          })
  end

  def update
    # Handle avatar updates
    if params[:user][:avatar].present?
      @user.avatar.attach(params[:user][:avatar])
    elsif params[:user][:remove_avatar] == 'true'
      @user.reset_avatar_to_default
    end

    # Handle currently_playing updates
    if params[:user][:currently_playing].present?
      game_id = params[:user][:currently_playing]

      if game_id == 'none'
        @user.user_game.destroy if @user.user_game.present?
      else
        user_game = @user.user_game

        if user_game.present?
          user_game.update(game_id:)
        else
          @user.create_user_game(game_id:)
        end
      end
    end

    # Check if the user is trying to update their password
    if params[:user][:new_password].present?
      if @user.valid_password?(params[:user][:password])
        if @user.update(password: params[:user][:new_password])
          render json: format_user(@user)
        else
          render json: { errors: @user.errors.full_messages }, status: :unprocessable_entity
        end
      else
        render json: { error: 'Invalid current password' }, status: :unauthorized
      end
    # Update other fields, excluding password fields
    elsif @user.update(user_params.except(:password, :new_password))
      render json: format_user(@user)
    else
      render json: { errors: @user.errors.full_messages }, status: :unprocessable_entity
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
        avatar_url: user.avatar_url,
        slug: user.slug
      }
    end

    render json: users
  end

  def attempts
    attempts = @user.attempts.includes(:challenge, challenge: :game).where.not(status: 'Pending')

    # Order attempts based on status and timestamps
    attempts = attempts.order(
      Arel.sql(<<~SQL)
        CASE status
          WHEN 'In Progress' THEN 0
          WHEN 'Complete' THEN 1
          ELSE 2
        END,
        COALESCE(completed_at, created_at) DESC
      SQL
    )

    per_page = 10
    page = params[:page].to_i.positive? ? params[:page].to_i : 1
    paginated_attempts = attempts.offset((page - 1) * per_page).limit(per_page)

    challenge_ids = paginated_attempts.map(&:challenge_id)

    user_ratings = if current_user
                     Difficulty.where(user: current_user, challenge_id: challenge_ids)
                               .pluck(:challenge_id, :rating)
                               .to_h
                   else
                     {}
                   end

    attempts_with_metadata = paginated_attempts.map do |attempt|
      format_attempt(attempt).merge(
        is_owner: current_user.present? && current_user == attempt.user,
        user_approved: current_user.present? && current_user.approvals.exists?(attempt:),
        user_challenge_rating: user_ratings[attempt.challenge_id]
      )
    end

    render json: attempts_with_metadata
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

  private

  def user_params
    params.require(:user).permit(:avatar, :username, :email, :bio, :password, :new_password)
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
                         avatar_url: user.avatar_url,
                         points: user.points,
                         active_attempts_count: user.active_attempts_count,
                         challenges_count: user.challenges_count,
                         following_count: user.followees_count,
                         followers_count: user.followers_count
                       })
  end

  def format_attempt(attempt)
    attempt.as_json(
      include: {
        challenge: {
          include: %i[game user],
          methods: %i[difficulty_rating difficulties_count]
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
