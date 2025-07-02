class RemoveOldFieldsFromGames < ActiveRecord::Migration[7.0]
  def change
    remove_column :games, :cover, :string
    remove_column :games, :description, :text
    remove_column :games, :platform, :string
  end
end
