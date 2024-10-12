class Api::V1::DifficultiesController < ApplicationController
  before_action :authenticate_user!

  rescue_from CanCan::AccessDenied do |exception|
    render json: { warning: exception }, status: :unauthorized
  end

  def create
    challenge = Challenge.find(params[:challenge_id])
    existing_difficulty = Difficulty.find_by(user_id: current_user.id, challenge_id: challenge.id)

    if existing_difficulty
      if existing_difficulty.rating == params[:rating].to_i
        existing_difficulty.destroy
        render json: { message: 'Rating removed successfully.', average_rating: challenge.average_difficulty },
               status: :ok
      else
        existing_difficulty.update(rating: params[:rating])
        render json: { message: 'Rating updated successfully.', average_rating: challenge.average_difficulty },
               status: :ok
      end
    else
      difficulty = Difficulty.new(user: current_user, challenge:, rating: params[:rating])

      if difficulty.save
        render json: { message: 'Rating created successfully.', average_rating: challenge.average_difficulty },
               status: :created
      else
        render json: { error: difficulty.errors.full_messages }, status: :unprocessable_entity
      end
    end
  end
end
