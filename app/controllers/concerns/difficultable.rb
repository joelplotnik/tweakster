module Difficultable
  extend ActiveSupport::Concern

  def handle_existing_difficulty(existing_difficulty, rating)
    if existing_difficulty.rating == rating.to_i
      existing_difficulty.destroy
      render json: { message: 'Rating removed successfully.', average_rating: average_difficulty(existing_difficulty.challenge) },
             status: :ok
    else
      existing_difficulty.update(rating:)
      render json: { message: 'Rating updated successfully.', average_rating: average_difficulty(existing_difficulty.challenge) },
             status: :ok
    end
  end

  def create_new_difficulty(challenge, rating)
    difficulty = challenge.difficulties.build(user: current_user, rating:)

    if difficulty.save
      render json: { message: 'Rating created successfully.', average_rating: average_difficulty(challenge) },
             status: :created
    else
      render json: { error: difficulty.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def average_difficulty(challenge)
    challenge.average_difficulty
  end
end
