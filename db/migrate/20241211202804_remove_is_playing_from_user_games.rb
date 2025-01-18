class RemoveIsPlayingFromUserGames < ActiveRecord::Migration[7.0]
  def change
    remove_column :user_games, :is_playing, :boolean
  end
end
