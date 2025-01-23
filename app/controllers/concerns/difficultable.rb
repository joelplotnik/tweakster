module Difficultable
  extend ActiveSupport::Concern

  def handle_existing_difficulty(existing_difficulty, rating)
    if existing_difficulty.rating == rating.to_i
      existing_difficulty.destroy
      render json: { message: 'Rating removed successfully.', difficulty_rating: existing_difficulty.challenge.difficulty_rating, difficulties_count: existing_difficulty.challenge.difficulties_count },
             status: :ok
    else
      existing_difficulty.update(rating:)
      render json: { message: 'Rating updated successfully.', difficulty_rating: existing_difficulty.challenge.difficulty_rating, difficulties_count: existing_difficulty.challenge.difficulties_count },
             status: :ok
    end
  end

  def create_new_difficulty(challenge, rating)
    difficulty = challenge.difficulties.build(user: current_user, rating:)

    if difficulty.save
      render json: { message: 'Rating created successfully.', difficulty_rating: challenge.difficulty_rating, difficulties_count: challenge.difficulties_count },
             status: :created
    else
      render json: { error: difficulty.errors.full_messages }, status: :unprocessable_entity
    end
  end
end
