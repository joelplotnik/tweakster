class ChangeLikesAndDislikesToUpvotesAndDownvotesInPieces < ActiveRecord::Migration[7.0]
  def change
    rename_column :pieces, :likes, :upvotes
    rename_column :pieces, :dislikes, :downvotes
  end
end
