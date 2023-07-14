class ChangeTotalToCountInPiecesAndChannels < ActiveRecord::Migration[7.0]
  def change
    rename_column :pieces, :total_comments, :comments_count
    rename_column :channels, :total_users, :subscriptions_count
  end
end
