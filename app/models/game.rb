class Game < ApplicationRecord
  extend FriendlyId
  friendly_id :name, use: :slugged

  has_many :user_games
  has_many :users, through: :user_games
  has_many :challenges, dependent: :destroy

  validates :name, presence: true, uniqueness: { scope: :platform, message: 'already exists on this platform.' }
  validates :platform, presence: true
end
