class RemoveParentPieceIdFromPieces < ActiveRecord::Migration[7.0]
  def change
    remove_column :pieces, :parent_piece_id
  end
end
