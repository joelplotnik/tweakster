class CreateAcceptedChallenges < ActiveRecord::Migration[7.0]
  def change
    create_table :accepted_challenges do |t|
      t.references :user, null: false, foreign_key: true
      t.references :challenge, null: false, foreign_key: true
      t.string :status
      t.datetime :completed_at

      t.timestamps
    end
  end
end
