class CreateVotes < ActiveRecord::Migration[7.0]
  def change
    create_table :votes do |t|
      t.integer :vote_type, null: false
      t.references :user, null: false, foreign_key: true
      t.references :challenge, null: false, foreign_key: true

      t.timestamps
    end

    add_column :challenges, :upvotes, :integer, default: 0
    add_column :challenges, :downvotes, :integer, default: 0
  end
end
