class CreateUserGames < ActiveRecord::Migration[7.0]
  def change
    create_table :user_games do |t|
      t.references :user, null: false, foreign_key: true
      t.references :game, null: false, foreign_key: true
      t.boolean :is_playing

      t.timestamps
    end
  end
end
