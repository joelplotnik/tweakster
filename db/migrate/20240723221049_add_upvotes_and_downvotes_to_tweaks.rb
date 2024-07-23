class AddUpvotesAndDownvotesToTweaks < ActiveRecord::Migration[7.0]
  def change
    add_column :tweaks, :upvotes, :integer
    add_column :tweaks, :downvotes, :integer
  end
end
