class UpdateCommentsForPolymorphicAssociation < ActiveRecord::Migration[7.0]
  def change
    remove_column :comments, :piece_id, :integer

    add_column :comments, :commentable_type, :string, null: false
    add_column :comments, :commentable_id, :integer, null: false

    add_index :comments, %i[commentable_type commentable_id]
  end
end
