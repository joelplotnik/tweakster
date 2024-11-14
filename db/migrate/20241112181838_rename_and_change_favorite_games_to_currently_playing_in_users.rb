class RenameAndChangeFavoriteGamesToCurrentlyPlayingInUsers < ActiveRecord::Migration[7.0]
  def change
    rename_column :users, :favorite_games, :currently_playing
    change_column :users, :currently_playing, :string, default: ''
  end
end
