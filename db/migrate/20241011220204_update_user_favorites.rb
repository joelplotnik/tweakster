class UpdateUserFavorites < ActiveRecord::Migration[7.0]
  def change
    remove_column :users, :integrity, :float
    remove_column :users, :favorite_users, :text
    remove_column :users, :favorite_channels, :text
    add_column :users, :favorite_games, :text
  end
end
