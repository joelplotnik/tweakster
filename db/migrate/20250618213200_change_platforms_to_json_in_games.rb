class ChangePlatformsToJsonInGames < ActiveRecord::Migration[7.0]
  def change
    change_column :games, :platforms, :json, using: 'platforms'
  end
end
