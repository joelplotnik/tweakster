class Comment < ApplicationRecord
  belongs_to :user
  belongs_to :commentable, polymorphic: true

  has_many :votes, as: :votable, dependent: :destroy
  has_many :notification_mentions, as: :record, dependent: :destroy, class_name: 'Noticed::Event'

  validates :user_id, presence: true
  validates :commentable, presence: true
  validates :message, presence: true, length: { minimum: 1, maximum: 2200 }
end
