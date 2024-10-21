class Game < ApplicationRecord
  has_many :challenges, dependent: :destroy

  has_one_attached :image

  validates :name, presence: true, uniqueness: { scope: :platform, message: 'already exists on this platform.' }
  validates :platform, presence: true

  def image_url
    Rails.application.routes.url_helpers.url_for(image) if image.attached?
  end
end
