class Api::V1::ChallengesController < ApplicationController
  load_and_authorize_resource
  before_action :authenticate_user!, except: %i[show]

  rescue_from CanCan::AccessDenied do |exception|
    render json: { warning: exception }, status: :unauthorized
  end

  def show
    challenge = Challenge.find(params[:id])
    render json: {
      id: challenge.id,
      name: challenge.name,
      description: challenge.description,
      likes_count: challenge.likes_count,
      average_difficulty: challenge.average_difficulty,
      created_at: challenge.created_at,
      updated_at: challenge.updated_at
    }
  end

  def create
    challenge = Challenge.new(challenge_params)
    if challenge.save
      render json: { message: 'Challenge created successfully', challenge: }, status: :created
    else
      render json: { errors: challenge.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    challenge = Challenge.find(params[:id])
    if challenge.update(challenge_params)
      render json: { message: 'Challenge updated successfully', challenge: }
    else
      render json: { errors: challenge.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    challenge = Challenge.find(params[:id])
    challenge.destroy
    render json: { message: 'Challenge deleted successfully' }, status: :no_content
  end

  private

  def challenge_params
    params.require(:challenge).permit(:name, :description)
  end
end
