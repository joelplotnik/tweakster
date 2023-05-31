class RenameArticlesToPieces < ActiveRecord::Migration[7.0]
  def change
    rename_table :articles, :pieces
  end
end
