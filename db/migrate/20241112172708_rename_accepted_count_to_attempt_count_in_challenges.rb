class RenameAcceptedCountToAttemptCountInChallenges < ActiveRecord::Migration[7.0]
  def change
    rename_column :challenges, :accepted_count, :attempt_count
  end
end
