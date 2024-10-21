class AddApprovalsCountToAcceptedChallenges < ActiveRecord::Migration[7.0]
  def change
    add_column :accepted_challenges, :approvals_count, :integer, default: 0
  end
end
