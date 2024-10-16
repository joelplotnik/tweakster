class Api::V1::AcceptedChallengesController < ApplicationController
  load_and_authorize_resource
  before_action :authenticate_user!, except: %i[index show]
  before_action :set_user, only: [:index]
  before_action :set_challenge, only: [:index]
  before_action :set_accepted_challenge, only: %i[show update destroy]

  rescue_from CanCan::AccessDenied do |exception|
    render json: { warning: exception.message }, status: :unauthorized
  end

  # GET /api/v1/users/:user_id/accepted_challenges
  # GET /api/v1/games/:game_id/challenges/:challenge_id/accepted_challenges
  def index
    if @challenge
      @accepted_challenges = @challenge.accepted_challenges.includes(challenge: %i[game difficulty likes])
    elsif @user
      @accepted_challenges = @user.accepted_challenges.includes(challenge: %i[game difficulty likes])
    else
      render json: { error: 'User or challenge must be specified' }, status: :unprocessable_entity and return
    end

    render json: @accepted_challenges.as_json(include: {
                                                challenge: {
                                                  include: %i[game difficulty likes]
                                                }
                                              })
  end

  # GET /api/v1/users/:user_id/accepted_challenges/:id
  def show
    render json: @accepted_challenge.as_json(include: {
                                               challenge: {
                                                 include: :game
                                               }
                                             })
  end

  # POST /api/v1/games/:game_id/challenges/:challenge_id/accepted_challenges
  def create
    accepted_challenge = current_user.accepted_challenges.new(accepted_challenge_params.merge(challenge_id: @challenge.id))

    if accepted_challenge.save
      render json: { message: 'Challenge accepted successfully', accepted_challenge: }, status: :created
    else
      render json: { errors: accepted_challenge.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /api/v1/users/:user_id/accepted_challenges/:id
  def update
    if @accepted_challenge.user_id == current_user.id
      if @accepted_challenge.update(accepted_challenge_params)
        render json: { message: 'Accepted challenge updated successfully', accepted_challenge: }
      else
        render json: { errors: @accepted_challenge.errors.full_messages }, status: :unprocessable_entity
      end
    else
      render json: { error: 'You are not authorized to update this challenge' }, status: :forbidden
    end
  end

  # DELETE /api/v1/users/:user_id/accepted_challenges/:id
  def destroy
    if @accepted_challenge.user_id == current_user.id
      @accepted_challenge.destroy
      render json: { message: 'Accepted challenge deleted successfully' }, status: :no_content
    else
      render json: { error: 'You are not authorized to delete this challenge' }, status: :forbidden
    end
  end

  private

  def set_user
    @user = User.find(params[:user_id]) if params[:user_id]
  end

  def set_challenge
    @challenge = Challenge.find(params[:challenge_id]) if params[:challenge_id]
  end

  def set_accepted_challenge
    @accepted_challenge = AcceptedChallenge.find(params[:id])
  end

  def accepted_challenge_params
    params.require(:accepted_challenge).permit(:challenge_id, :status)
  end
end
