class AddIgdbFieldsToGames < ActiveRecord::Migration[7.0]
  def change
    add_column :games, :igdb_id, :integer
    add_index  :games, :igdb_id, unique: true

    add_column :games, :igdb_updated_at, :datetime

    add_column :games, :summary, :text
    add_column :games, :cover_url, :string
    add_column :games, :first_release_date, :datetime

    add_column :games, :platforms, :string
  end
end
