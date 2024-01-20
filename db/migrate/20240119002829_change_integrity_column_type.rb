class ChangeIntegrityColumnType < ActiveRecord::Migration[7.0]
  def change
    change_column :users, :integrity, :float
  end
end
