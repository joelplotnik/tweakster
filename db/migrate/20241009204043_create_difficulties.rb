class CreateDifficulties < ActiveRecord::Migration[7.0]
  def change
    create_table :difficulties do |t|
      t.references :challenge, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.integer :rating

      t.timestamps
    end
  end
end
