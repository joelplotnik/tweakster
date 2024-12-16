class RemoveAttemptCountAndApprovalsCount < ActiveRecord::Migration[7.0]
  def change
    remove_column :challenges, :attempt_count, :integer
    remove_column :attempts, :approvals_count, :integer
  end
end
