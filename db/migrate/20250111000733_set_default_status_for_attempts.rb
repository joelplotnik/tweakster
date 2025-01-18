class SetDefaultStatusForAttempts < ActiveRecord::Migration[7.0]
  def change
    change_column_default :attempts, :status, from: 'To Do', to: 'Pending'
  end
end
