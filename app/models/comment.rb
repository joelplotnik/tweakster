class Comment < ApplicationRecord
  belongs_to :user
  belongs_to :commentable, polymorphic: true
  belongs_to :parent, class_name: 'Comment', optional: true

  has_many :children, class_name: 'Comment', foreign_key: :parent_id, dependent: :destroy
  has_many :likes, as: :likeable, dependent: :destroy
  has_many :notification_mentions, as: :record, dependent: :destroy, class_name: 'Noticed::Event'

  validates :user_id, presence: true
  validates :commentable, presence: true
  validates :message, presence: true, length: { minimum: 1, maximum: 2200 }

  validate :cannot_be_parent_if_reply

  private

  def cannot_be_parent_if_reply
    return unless parent_id.present?
    return unless parent.present? && parent.parent_id.present?

    errors.add(:base, 'A comment that is a reply cannot become a parent comment.')
  end
end
