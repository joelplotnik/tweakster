class CreateChallenges < ActiveRecord::Migration[7.0]
  def change
    create_table :challenges do |t|
      t.string :title
      t.text :description
      t.references :game, null: false, foreign_key: true
      t.integer :likes_count

      t.timestamps
    end
  end
end
