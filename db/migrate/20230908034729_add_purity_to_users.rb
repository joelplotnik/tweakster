class AddPurityToUsers < ActiveRecord::Migration[7.0]
  def change
    add_column :users, :purity, :integer, default: 0
  end
end
