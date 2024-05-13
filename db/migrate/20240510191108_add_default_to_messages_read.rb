class AddDefaultToMessagesRead < ActiveRecord::Migration[7.0]
  def change
    change_column_default :messages, :read, from: nil, to: false
  end
end
