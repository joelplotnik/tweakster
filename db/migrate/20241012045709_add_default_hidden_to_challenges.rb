class AddDefaultHiddenToChallenges < ActiveRecord::Migration[7.0]
  def change
    change_column_default :challenges, :hidden, from: nil, to: false
  end
end
