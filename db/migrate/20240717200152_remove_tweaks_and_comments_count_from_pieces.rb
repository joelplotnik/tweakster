class RemoveTweaksAndCommentsCountFromPieces < ActiveRecord::Migration[7.0]
  def change
    remove_column :pieces, :tweaks_count, :integer
    remove_column :pieces, :comments_count, :integer
  end
end
