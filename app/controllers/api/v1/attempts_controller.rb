class Api::V1::AttempsController < ApplicationController
  before_action :doorkeeper_authorize!, except: %i[index show popular_attempts]
  before_action :set_user, only: [:index]
  before_action :set_challenge, only: [:index]
  before_action :set_attempt, only: %i[show update destroy]

  # GET /api/v1/users/:user_id/attempts
  # GET /api/v1/games/:game_id/challenges/:challenge_id/attempts
  def index
    if @challenge
      @attempts = @challenge.attempts.includes(:challenge, challenge: :game)
    elsif @user
      @attempts = @user.attempts.includes(:challenge, challenge: :game)
    else
      render json: { error: 'User or challenge must be specified' }, status: :unprocessable_entity and return
    end

    render json: @attempts.map { |attempt| format_attempt(attempt) }
  end

  # GET /api/v1/popular_attempts
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

  # GET /api/v1/users/:user_id/attempts/:id
  def show
    render json: format_attempt(@attempt)
  end

  # POST /api/v1/games/:game_id/challenges/:challenge_id/attempts
  def create
    attempt = current_user.attempts.new(attempt_params.merge(challenge_id: @challenge.id))

    if attempt.save
      render json: { message: 'Challenge attempt created successfully', attempt: format_attempt(attempt) },
             status: :created
    else
      render json: { errors: attempt.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /api/v1/users/:user_id/attempts/:id
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

  # DELETE /api/v1/users/:user_id/attempts/:id
  def destroy
    if @attempt.user_id == current_user.id
      @attempt.destroy
      render json: { message: 'Attempt deleted successfully' }, status: :no_content
    else
      render json: { error: 'You are not authorized to delete this challenge' }, status: :forbidden
    end
  end

  private

  def attempt_params
    params.require(:attempt).permit(:challenge_id, :status)
  end

  def set_user
    @user = User.find(params[:user_id]) if params[:user_id]
  end

  def set_challenge
    @challenge = Challenge.find(params[:challenge_id]) if params[:challenge_id]
  end

  def set_attempt
    @attempt = Attempt.find(params[:id])
  end

  def format_attempt(attempt)
    attempt.as_json(include: {
                      challenge: {
                        include: :game
                      }
                    })
  end
end
