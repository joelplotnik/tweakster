class RemoveDifficultyRatingFromChallenges < ActiveRecord::Migration[7.0]
  def change
    remove_column :challenges, :difficulty_rating, :float
  end
end
