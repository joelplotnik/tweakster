class RenameTwitchVideoLinkToVideoLinkInAttempts < ActiveRecord::Migration[7.0]
  def change
    rename_column :attempts, :twitch_video_link, :video_link
  end
end
