class RemoveLikesCountFromChallenges < ActiveRecord::Migration[7.0]
  def change
    remove_column :challenges, :likes_count, :integer, default: 0
  end
end
