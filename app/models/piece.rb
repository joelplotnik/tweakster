class Piece < ApplicationRecord
  belongs_to :user
  belongs_to :channel

  has_many_attached :images

  has_many :votes, as: :votable, dependent: :destroy
  has_many :comments, as: :commentable, dependent: :destroy
  has_many :tweaks, dependent: :destroy
  has_many :notification_mentions, as: :record, dependent: :destroy, class_name: 'Noticed::Event'

  validates :title, presence: true, length: { minimum: 1, maximum: 300 }
  validate :material
  validate :valid_youtube_url, if: -> { youtube_url.present? }

  after_destroy_commit :delete_attached_images

  private

  def material
    return if images.attached? || content.present? || youtube_url.present?

    errors.add(:base, 'A piece must have at least one image, content, or YouTube URL')
  end

  def valid_youtube_url
    unless youtube_url =~ %r{\A(?:https?://)?(?:www\.)?(?:youtube\.com/(?:[^/\n\s]+/\S+/|(?:v|e(?:mbed)?)/|\S*?[?&]v=)|youtu\.be/)([a-zA-Z0-9_-]{11})(?:\S*[?&]t=\d+[mhs])?\z}
      errors.add(:youtube_url, 'must be a valid YouTube URL')
    end
  end

  def delete_attached_images
    images.each(&:purge)
  end
end
