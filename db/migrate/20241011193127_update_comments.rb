class UpdateComments < ActiveRecord::Migration[7.0]
  def change
    remove_column :comments, :upvotes, :integer
    remove_column :comments, :downvotes, :integer

    add_column :comments, :likes_count, :integer, default: 0

    add_reference :comments, :parent, foreign_key: { to_table: :comments }
  end
end
