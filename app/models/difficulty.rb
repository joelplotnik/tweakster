class Difficulty < ApplicationRecord
  belongs_to :challenge
  belongs_to :user

  validates :rating, numericality: { greater_than_or_equal_to: 1, less_than_or_equal_to: 5 }

  after_create :update_difficulty_rating
  after_update :update_difficulty_rating
  after_destroy :update_difficulty_rating

  private

  def update_difficulty_rating
    challenge.update!(difficulty_rating: challenge.difficulties.average(:rating) || 0)
  end
end
