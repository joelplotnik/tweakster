class Challenge < ApplicationRecord
  belongs_to :user
  belongs_to :game

  has_one_attached :image

  has_many :attempts, dependent: :restrict_with_error
  has_many :comments, as: :commentable, dependent: :destroy
  has_many :votes, dependent: :destroy
  has_many :difficulties, dependent: :destroy

  attribute :hidden, :boolean, default: false

  validates :title, presence: true
  validates :description, presence: true

  CATEGORIES = [
    'Perfectionist',
    'Strategic Planning',
    'Meticulous Collection',
    'Precision-Based',
    'Resource Management',
    'Puzzle and Logic',
    'Time-Efficiency',
    'Skill Mastery',
    'Completionist',
    'Self-Improvement'
  ].freeze

  validates :category, inclusion: { in: CATEGORIES }

  validates_uniqueness_of :title, scope: :game_id, message: 'Title must be unique within a game'

  def image_url
    Rails.application.routes.url_helpers.url_for(image) if image.attached?
  end

  def comments_count
    comments.size
  end

  def attempts_count
    attempts.size
  end

  def difficulty_rating
    difficulties.average(:rating).to_f.round
  end
end
