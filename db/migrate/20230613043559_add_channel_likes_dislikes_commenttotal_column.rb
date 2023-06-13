class AddChannelLikesDislikesCommenttotalColumn < ActiveRecord::Migration[7.0]
  def change
    add_column :pieces, :channel_id, :integer
    add_column :pieces, :likes, :integer, default: 0
    add_column :pieces, :dislikes, :integer, default: 0
    add_column :pieces, :total_comments, :integer, default: 0
  end
end
