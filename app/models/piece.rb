class Piece < ApplicationRecord
  belongs_to :user
  belongs_to :channel
  belongs_to :parent_piece, class_name: 'Piece', counter_cache: :tweaks_count, optional: true

  has_many_attached :images
  has_many :votes, as: :votable, dependent: :destroy
  has_many :comments, dependent: :destroy
  has_many :child_pieces, class_name: 'Piece', foreign_key: 'parent_piece_id', dependent: :destroy
  has_many :notification_mentions, as: :record, dependent: :destroy, class_name: 'Noticed::Event'

  validates :title, presence: true, length: { minimum: 1, maximum: 300 }
  validate :has_material
  validate :valid_youtube_url, if: -> { youtube_url.present? }
  validate :has_tweaks, on: :update
  validate :parent_piece_depth

  after_destroy_commit :delete_attached_images

  private

  def has_material
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

  def has_tweaks
    return unless child_pieces.exists?

    errors.add(:base, 'Cannot update piece with child pieces')
  end

  def parent_piece_depth
    return unless parent_piece.present? && parent_piece.parent_piece.present?

    errors.add(:parent_piece, 'can only be a top-level piece or a tweak of a top-level piece')
  end
end
