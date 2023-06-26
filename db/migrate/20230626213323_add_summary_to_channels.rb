class AddSummaryToChannels < ActiveRecord::Migration[7.0]
  def change
    add_column :channels, :summary, :string
  end
end
