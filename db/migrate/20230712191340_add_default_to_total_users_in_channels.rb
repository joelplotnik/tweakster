class AddDefaultToTotalUsersInChannels < ActiveRecord::Migration[7.0]
  def change
    change_column :channels, :total_users, :integer, default: 0
  end
end
