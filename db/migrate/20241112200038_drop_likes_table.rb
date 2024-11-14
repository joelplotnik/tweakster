class DropLikesTable < ActiveRecord::Migration[7.0]
  def change
    drop_table :likes
  end
end
