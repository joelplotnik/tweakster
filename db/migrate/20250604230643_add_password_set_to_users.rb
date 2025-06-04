class AddPasswordSetToUsers < ActiveRecord::Migration[7.0]
  def change
    add_column :users, :password_set, :boolean, default: false
  end
end
