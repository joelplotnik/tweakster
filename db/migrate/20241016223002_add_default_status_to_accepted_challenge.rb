class AddDefaultStatusToAcceptedChallenge < ActiveRecord::Migration[7.0]
  def change
    change_column_default :accepted_challenges, :status, 'To Do'
  end
end
