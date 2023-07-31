class AddTweaksCountToPieces < ActiveRecord::Migration[7.0]
  def change
    add_column :pieces, :tweaks_count, :integer, default: 0
  end
end
