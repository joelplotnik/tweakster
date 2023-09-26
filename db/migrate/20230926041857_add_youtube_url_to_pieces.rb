class AddYoutubeUrlToPieces < ActiveRecord::Migration[7.0]
  def change
    add_column :pieces, :youtube_url, :string
  end
end
