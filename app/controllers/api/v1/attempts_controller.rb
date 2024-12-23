class Api::V1::AttemptsController < ApplicationController
  skip_before_action :verify_authenticity_token, raise: false
  before_action :authenticate_devise_api_token!, only: %i[create update destroy]
  before_action :set_challenge, only: [:index]
  before_action :set_attempt, only: %i[show update destroy]

  def index
    attempts = @challenge.attempts
                         .includes(:challenge, challenge: :game)
                         .order(created_at: :desc)

    per_page = 10
    page = params[:page].to_i.positive? ? params[:page].to_i : 1
    paginated_attempts = attempts.offset((page - 1) * per_page).limit(per_page)

    attempts_with_metadata = paginated_attempts.map do |attempt|
      format_attempt(attempt)
    end

    render json: attempts_with_metadata
  end

  def show
    render json: format_attempt(@attempt)
  end

  def create
    attempt = current_user.attempts.new(attempt_params.merge(challenge_id: @challenge.id))

    if attempt.save
      render json: { message: 'Challenge attempt created successfully', attempt: format_attempt(attempt) },
             status: :created
    else
      render json: { errors: attempt.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @attempt.user_id == current_user.id
      if @attempt.update(attempt_params)
        render json: { message: 'Attempt updated successfully',
                       attempt: format_attempt(@attempt) }
      else
        render json: { errors: @attempt.errors.full_messages }, status: :unprocessable_entity
      end
    else
      render json: { error: 'You are not authorized to update this challenge' }, status: :forbidden
    end
  end

  def destroy
    if @attempt.user_id == current_user.id
      @attempt.destroy
      render json: { message: 'Attempt deleted successfully' }, status: :no_content
    else
      render json: { error: 'You are not authorized to delete this challenge' }, status: :forbidden
    end
  end

  def popular_attempts
    limit = params[:limit] || 5
    page = params[:page] || 1
    point_in_time = params[:point_in_time] || Time.current

    popular_attempts = Attempt
                       .left_joins(:approvals)
                       .where('approvals.created_at >= ? AND approvals.created_at <= ?', 7.days.ago, point_in_time)
                       .group('attempts.id')
                       .order('COUNT(approvals.id) DESC')
                       .paginate(page:, per_page: limit)
                       .includes(:challenge)
                       .map { |attempt| format_attempt(attempt) }

    render json: { attempts: popular_attempts, point_in_time: }, status: :ok
  end

  private

  def attempt_params
    params.require(:attempt).permit(:challenge_id, :status)
  end

  def set_user
    @user = User.friendly.find(params[:user_id]) if params[:user_id]
  end

  def set_challenge
    @challenge = Challenge.find(params[:challenge_id]) if params[:challenge_id]
  end

  def set_attempt
    @attempt = Attempt.find(params[:id]) if params[:id]
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
