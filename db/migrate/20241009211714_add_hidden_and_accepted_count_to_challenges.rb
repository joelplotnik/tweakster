class AddHiddenAndAcceptedCountToChallenges < ActiveRecord::Migration[7.0]
  def change
    add_column :challenges, :hidden, :boolean
    add_column :challenges, :accepted_count, :integer
  end
end
