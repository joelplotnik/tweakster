class Api::V1::AttemptsController < ApplicationController
  skip_before_action :verify_authenticity_token, raise: false
  before_action :authenticate_devise_api_token!, only: %i[create update destroy]
  before_action :authenticate_devise_api_token_if_present!, only: %i[index show attempts]
  before_action :set_challenge, only: %i[index create destroy]
  before_action :set_attempt, only: %i[show update destroy]

  def index
    attempts = @challenge.attempts
                         .includes(:challenge, challenge: :game)
                         .where.not(status: 'Pending')
                         .order(created_at: :desc)

    paginated_attempts = attempts.paginate(page: params[:page], per_page: 10)

    user_ratings = if current_user
                     Difficulty.where(user: current_user, challenge_id: paginated_attempts.pluck(:challenge_id))
                               .pluck(:challenge_id, :rating).to_h
                   else
                     {}
                   end

    attempts_with_metadata = paginated_attempts.map do |attempt|
      attempt_data = format_attempt(attempt)

      attempt_data[:is_owner] = current_user.present? && (current_user == attempt.user)
      attempt_data[:user_approved] = current_user.present? && current_user.approvals.exists?(attempt_id: attempt.id)
      attempt_data[:user_challenge_rating] = user_ratings[attempt.challenge_id]

      attempt_data
    end

    render json: attempts_with_metadata
  end

  def show
    is_owner = current_user.present? && current_user == @attempt.user
    user_rating = current_user ? Difficulty.find_by(user: current_user, challenge: @attempt.challenge)&.rating : nil
    user_approved = if @attempt.status == 'Complete' && current_user
                      Approval.exists?(user: current_user, attempt: @attempt)
                    else
                      false
                    end

    render json: format_attempt(@attempt).merge({
                                                  is_owner:,
                                                  user_rating:,
                                                  user_approved:
                                                })
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

  # def update
  #   if @attempt.present? && current_user == @attempt.user
  #     if @attempt.update(attempt_params)
  #       render json: { message: 'Attempt updated successfully',
  #                      attempt: format_attempt(@attempt) }
  #     else
  #       render json: { errors: @attempt.errors.full_messages }, status: :unprocessable_entity
  #     end
  #   else
  #     render json: { error: 'You are not authorized to update this challenge' }, status: :forbidden
  #   end
  # end

  def destroy
    render json: { error: 'Attempt not found' }, status: :not_found and return unless @attempt

    unless current_user == @attempt.user
      render json: { error: 'Unauthorized to delete this attempt' }, status: :unauthorized and return
    end

    if @attempt.destroy
      render json: { message: 'Attempt deleted successfully', attempt_id: @attempt.id }, status: :ok
    else
      render json: { error: 'Failed to delete attempt' }, status: :unprocessable_entity
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
