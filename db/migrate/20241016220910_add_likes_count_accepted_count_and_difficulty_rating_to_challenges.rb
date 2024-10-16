class AddLikesCountAcceptedCountAndDifficultyRatingToChallenges < ActiveRecord::Migration[7.0]
  def change
    change_column_default :challenges, :likes_count, 0
    change_column_default :challenges, :accepted_count, 0
    
    add_column :challenges, :difficulty_rating, :float, default: 0.0
  end
end
