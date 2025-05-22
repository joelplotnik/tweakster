class AddTwitchVideoLinkToAttempts < ActiveRecord::Migration[7.0]
  def change
    add_column :attempts, :twitch_video_link, :string
  end
end
