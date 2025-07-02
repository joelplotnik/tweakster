class Game < ApplicationRecord
  extend FriendlyId
  friendly_id :name, use: :slugged

  has_many :user_games
  has_many :users, through: :user_games
  has_many :challenges, dependent: :destroy

  validates :name, presence: true
  validates :igdb_id, presence: true, uniqueness: true

  def should_generate_new_friendly_id?
    name_changed?
  end
end
