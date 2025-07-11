class Challenge < ApplicationRecord
  belongs_to :user
  belongs_to :game

  has_one_attached :image

  has_many :attempts, dependent: :restrict_with_error
  has_many :comments, as: :commentable, dependent: :destroy
  has_many :votes, dependent: :destroy
  has_many :difficulties, dependent: :destroy

  attribute :hidden, :boolean, default: false

  before_validation :strip_whitespace

  validates :title, presence: true, length: { minimum: 3, maximum: 100 }
  validates :description, presence: true, length: { minimum: 10, maximum: 1000 }

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

  def strip_whitespace
    self.title = title.strip if title.present?
    self.description = description.strip if description.present?
  end

  def image_url
    Rails.application.routes.url_helpers.url_for(image) if image.attached?
  end

  def comments_count
    comments.size
  end

  def attempts_count
    attempts.size
  end

  def active_attempts_count
    attempts.where.not(status: 'Pending').size
  end

  def difficulties_count
    difficulties.size
  end

  def difficulty_rating
    difficulties.average(:rating).to_f.round
  end
end
