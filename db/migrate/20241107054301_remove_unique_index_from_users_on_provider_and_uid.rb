class RemoveUniqueIndexFromUsersOnProviderAndUid < ActiveRecord::Migration[7.0]
  def change
    remove_index :users, name: "index_users_on_provider_and_uid"
  end
end
