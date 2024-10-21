class AddNullConstraintToGames < ActiveRecord::Migration[7.0]
  def change
    change_column_null :games, :name, false
    change_column_null :games, :platform, false
  end
end
