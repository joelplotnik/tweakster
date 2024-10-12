class Game < ApplicationRecord
  include Gameable

  has_many :challenges, dependent: :destroy

  has_one_attached :image

  validates :name, presence: true, uniqueness: { scope: :platform, message: 'already exists on this platform.' }
  validates :platform, presence: true
end
