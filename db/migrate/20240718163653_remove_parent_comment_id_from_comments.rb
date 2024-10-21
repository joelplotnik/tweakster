class RemoveParentCommentIdFromComments < ActiveRecord::Migration[7.0]
  def change
    remove_column :comments, :parent_comment_id, :integer
  end
end
