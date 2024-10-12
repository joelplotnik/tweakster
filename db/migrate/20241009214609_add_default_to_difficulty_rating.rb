class AddDefaultToDifficultyRating < ActiveRecord::Migration[7.0]
  def change
    change_column_default :difficulties, :rating, 0
  end
end
