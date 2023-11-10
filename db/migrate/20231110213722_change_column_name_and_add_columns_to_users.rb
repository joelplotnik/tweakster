class ChangeColumnNameAndAddColumnsToUsers < ActiveRecord::Migration[7.0]
  def change
    rename_column :users, :purity, :integrity
    add_column :users, :bio, :text
    add_column :users, :url, :string
  end
end
