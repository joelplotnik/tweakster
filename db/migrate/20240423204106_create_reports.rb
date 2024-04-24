class CreateReports < ActiveRecord::Migration[7.0]
  def change
    create_table :reports do |t|
      t.string :content_type
      t.integer :content_id
      t.integer :reporter_id
      t.text :reason
      t.timestamps
    end
  end
end
