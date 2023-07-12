class AddParentPieceIdToPieces < ActiveRecord::Migration[7.0]
  def change
    add_reference :pieces, :parent_piece, null: true, foreign_key: { to_table: :pieces }
  end
end
