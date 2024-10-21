class Challenge < ApplicationRecord
  belongs_to :user
  belongs_to :game

  has_many :accepted_challenges, dependent: :restrict_with_error
  has_many :comments, as: :commentable, dependent: :destroy
  has_many :likes, as: :likeable, dependent: :destroy
  has_many :difficulties, dependent: :destroy

  attribute :hidden, :boolean, default: false
  attribute :accepted_count, :integer, default: 0

  validates :title, presence: true
  validates :description, presence: true
end
