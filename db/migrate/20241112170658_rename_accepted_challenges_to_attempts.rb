class RenameAcceptedChallengesToAttempts < ActiveRecord::Migration[7.0]
  def change
    rename_table :accepted_challenges, :attempts
  end
end
