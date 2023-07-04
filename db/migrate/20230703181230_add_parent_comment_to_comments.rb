class AddParentCommentToComments < ActiveRecord::Migration[7.0]
  def change
    add_reference :comments, :parent_comment, null: true, foreign_key: { to_table: :comments }
  end
end
