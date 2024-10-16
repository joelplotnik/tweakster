class AddDefaultValues < ActiveRecord::Migration[7.0]
  def change
    change_column_default :users, :url, ''
  end
end
