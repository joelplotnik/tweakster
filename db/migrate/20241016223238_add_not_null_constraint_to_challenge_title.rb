class AddNotNullConstraintToChallengeTitle < ActiveRecord::Migration[7.0]
  def change
    change_column_null :challenges, :title, false
  end
end
