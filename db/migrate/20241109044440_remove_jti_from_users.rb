class RemoveJtiFromUsers < ActiveRecord::Migration[7.0]
  def change
    remove_index :users, name: 'index_users_on_jti'
    remove_column :users, :jti
  end
end
