class RemoveCurrentlyPlayingAndUrlFromUsers < ActiveRecord::Migration[7.0]
  def change
    remove_column :users, :currently_playing, :string
    remove_column :users, :url, :string
  end
end
