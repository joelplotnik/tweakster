class DropOauthTables < ActiveRecord::Migration[7.0]
  def change
    drop_table :oauth_access_tokens, if_exists: true
    drop_table :oauth_applications, if_exists: true
  end
end
