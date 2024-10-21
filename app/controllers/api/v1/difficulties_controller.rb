class Api::V1::DifficultiesController < ApplicationController
  include Difficultable

  before_action :authenticate_user!
  before_action :set_challenge

  rescue_from CanCan::AccessDenied do |exception|
    render json: { warning: exception }, status: :unauthorized
  end

  def create
    existing_difficulty = Difficulty.find_by(user_id: current_user.id, challenge_id: @challenge.id)

    if existing_difficulty
      handle_existing_difficulty(existing_difficulty, difficulty_params[:rating])
    else
      create_new_difficulty(@challenge, difficulty_params[:rating])
    end
  end

  private

  def set_challenge
    @challenge = Challenge.find(params[:challenge_id])
  end

  def difficulty_params
    params.require(:difficulty).permit(:rating)
  end
end
