class UpdatePiecesTable < ActiveRecord::Migration[7.0]
  def change
    rename_column :pieces, :content, :body

    add_column :pieces, :image, :string
    add_column :pieces, :url, :string
    add_column :pieces, :dateTimePub, :datetime
    add_column :pieces, :authors, :text
    add_column :pieces, :links, :text
    add_column :pieces, :videos, :text
    add_column :pieces, :source, :string
  end
end
