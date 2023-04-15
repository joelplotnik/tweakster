class RemoveUserColumnFromArticles < ActiveRecord::Migration[7.0]
  def change
    remove_column :articles, :user
  end
end
