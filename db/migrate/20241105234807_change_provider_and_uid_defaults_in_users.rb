class ChangeProviderAndUidDefaultsInUsers < ActiveRecord::Migration[7.0]
  def change
    change_column :users, :bio, :string, default: ''
    change_column :users, :provider, :string, default: ''
    change_column :users, :uid, :string, default: ''
  end
end
