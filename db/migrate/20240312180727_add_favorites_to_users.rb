class AddFavoritesToUsers < ActiveRecord::Migration[7.0]
  def change
    add_column :users, :favorite_channels, :text
    add_column :users, :favorite_users, :text
  end
end
