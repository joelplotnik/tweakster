class AddIndexesToUsersAndChannels < ActiveRecord::Migration[7.0]
  def change
    add_index :users, :username, unique: true
    add_index :channels, :name, unique: true
  end
end
