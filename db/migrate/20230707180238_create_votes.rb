class CreateVotes < ActiveRecord::Migration[7.0]
  def change
    create_table :votes do |t|
      t.integer :user_id, null: false, foreign_key: true
      t.string :votable_type, null: false
      t.integer :votable_id, null: false
      t.integer :vote_type, null: false

      t.timestamps
    end

    add_index :votes, [:votable_type, :votable_id]
  end
end
