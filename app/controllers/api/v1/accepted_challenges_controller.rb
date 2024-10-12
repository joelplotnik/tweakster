class Api::V1::AcceptedChallengesController < ApplicationController
  load_and_authorize_resource
  before_action :authenticate_user!, except: %i[show]

  rescue_from CanCan::AccessDenied do |exception|
    render json: { warning: exception.message }, status: :unauthorized
  end

  def show
    accepted_challenge = AcceptedChallenge.find(params[:id])
    render json: {
      id: accepted_challenge.id,
      challenge_id: accepted_challenge.challenge_id,
      user_id: accepted_challenge.user_id,
      status: accepted_challenge.status,
      created_at: accepted_challenge.created_at,
      updated_at: accepted_challenge.updated_at
    }
  end

  def create
    accepted_challenge = AcceptedChallenge.new(accepted_challenge_params)
    if accepted_challenge.save
      render json: { message: 'Challenge accepted successfully', accepted_challenge: },
             status: :created
    else
      render json: { errors: accepted_challenge.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    accepted_challenge = AcceptedChallenge.find(params[:id])
    if accepted_challenge.update(accepted_challenge_params)
      render json: { message: 'Accepted challenge updated successfully', accepted_challenge: }
    else
      render json: { errors: accepted_challenge.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    accepted_challenge = AcceptedChallenge.find(params[:id])
    accepted_challenge.destroy
    render json: { message: 'Accepted challenge deleted successfully' }, status: :no_content
  end

  private

  def accepted_challenge_params
    params.require(:accepted_challenge).permit(:challenge_id, :user_id, :status)
  end
end
