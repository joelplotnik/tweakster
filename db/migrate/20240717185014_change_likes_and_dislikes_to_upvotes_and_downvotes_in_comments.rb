class ChangeLikesAndDislikesToUpvotesAndDownvotesInComments < ActiveRecord::Migration[7.0]
  def change
    rename_column :comments, :likes, :upvotes
    rename_column :comments, :dislikes, :downvotes
  end
end
