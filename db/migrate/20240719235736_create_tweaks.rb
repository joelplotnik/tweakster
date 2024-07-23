class CreateTweaks < ActiveRecord::Migration[7.0]
  def change
    create_table :tweaks do |t|
      t.text :annotation, null: false
      t.integer :piece_id, null: false
      t.integer :user_id, null: false
      t.integer :start_offset, null: false
      t.integer :end_offset, null: false
      t.string :style_type, null: false
      t.string :style_value
      t.timestamps
    end

    add_index :tweaks, :piece_id
    add_index :tweaks, :user_id
  end
end
