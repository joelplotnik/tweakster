class AddNullConstraintsToTables < ActiveRecord::Migration[7.0]
  def change
    change_column_null :channels, :name, false

    change_column_null :comments, :message, false
    change_column_null :comments, :user_id, false

    change_column_null :pieces, :title, false
    change_column_null :pieces, :content, false
    change_column_null :pieces, :user_id, false
    change_column_null :pieces, :channel_id, false

    change_column_null :relationships, :follower_id, false
    change_column_null :relationships, :followee_id, false

    change_column_null :reports, :content_type, false
    change_column_null :reports, :content_id, false
    change_column_null :reports, :reporter_id, false
    change_column_null :reports, :reason, false

    change_column_null :subscriptions, :user_id, false
    change_column_null :subscriptions, :channel_id, false
  end
end
