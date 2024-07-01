class DropMessagesTable < ActiveRecord::Migration[7.0]
  def up
    drop_table :messages
  end

  def down
    create_table :messages do |t|
      t.text :body
      t.datetime :created_at, null: false
      t.datetime :updated_at, null: false
      t.integer :sender_id
      t.integer :receiver_id
      t.boolean :read, default: false
    end
  end
end
