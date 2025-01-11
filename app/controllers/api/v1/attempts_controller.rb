class Api::V1::AttemptsController < ApplicationController
  skip_before_action :verify_authenticity_token, raise: false
  before_action :authenticate_devise_api_token!, only: %i[create update destroy]
  before_action :authenticate_devise_api_token_if_present!, only: %i[show attempts]
  before_action :set_challenge, only: %i[index create destroy]
  before_action :set_attempt, only: %i[show update destroy]

  def index
    attempts = @challenge.attempts
                         .includes(:challenge, challenge: :game)
                         .where.not(status: 'Pending')
                         .order(created_at: :desc)

    paginated_attempts = attempts.paginate(page: params[:page], per_page: 10)

    attempts_with_metadata = paginated_attempts.map do |attempt|
      attempt_data = format_attempt(attempt)

      attempt_data[:is_owner] = (current_user == attempt.user)

      attempt_data
    end

    render json: attempts_with_metadata
  end

  def show
    render json: format_attempt(@attempt)
  end

  def create
    attempt = current_user.attempts.new(attempt_params.merge(challenge_id: @challenge.id))

    if attempt.save
      render json: { message: 'Challenge attempt created successfully', attempt: },
             status: :created
    else
      render json: { errors: attempt.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @attempt.present? && current_user == @attempt.user
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
    attempt = current_user.attempts.find_by(id: params[:id], challenge_id: params[:challenge_id])

    if attempt
      attempt.destroy
      render json: { message: 'Attempt deleted successfully', attempt_id: attempt.id }, status: :ok
    else
      render json: { error: 'Attempt not found or unauthorized' }, status: :not_found
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
