class DropUnwantedTables < ActiveRecord::Migration[7.0]
  def change
    drop_table :tweaks, if_exists: true
    drop_table :votes, if_exists: true
    drop_table :subscriptions, if_exists: true
    drop_table :pieces, if_exists: true
    drop_table :channels, if_exists: true
  end
end
