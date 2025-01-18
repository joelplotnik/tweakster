class AddCoverToGames < ActiveRecord::Migration[7.0]
  def change
    add_column :games, :cover, :string
  end
end
