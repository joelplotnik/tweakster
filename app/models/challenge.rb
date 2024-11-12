class Challenge < ApplicationRecord
  belongs_to :user
  belongs_to :game

  has_many :attempts, dependent: :restrict_with_error
  has_many :comments, as: :commentable, dependent: :destroy
  has_many :difficulties, dependent: :destroy

  attribute :hidden, :boolean, default: false
  attribute :attempt_count, :integer, default: 0

  validates :title, presence: true
  validates :description, presence: true
end
