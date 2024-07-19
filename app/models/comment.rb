class Comment < ApplicationRecord
  belongs_to :user
  belongs_to :piece

  has_many :votes, as: :votable
  has_many :notification_mentions, as: :record, dependent: :destroy, class_name: 'Noticed::Event'

  validates :user_id, presence: true
  validates :piece_id, presence: true
  validates :message, presence: true, length: { minimum: 1, maximum: 2200 }
end
