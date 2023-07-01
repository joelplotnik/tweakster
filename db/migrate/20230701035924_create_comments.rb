class CreateComments < ActiveRecord::Migration[7.0]
  def change
    create_table :comments do |t|
      t.text :message
      t.integer :user_id
      t.integer :piece_id
      t.timestamps
    end
  end
end
