class Tweak < ApplicationRecord
  belongs_to :piece
  belongs_to :user

  has_many :comments, as: :commentable, dependent: :destroy
  has_many :votes, as: :votable, dependent: :destroy

  validates :annotation, presence: true
end
