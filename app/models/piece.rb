class Piece < ApplicationRecord
    belongs_to :user
    belongs_to :channel
    belongs_to :parent_piece, class_name: 'Piece', counter_cache: :tweaks_count, optional: true

    has_many_attached :images
    has_many :votes, as: :votable
    has_many :comments, dependent: :destroy
    has_many :child_pieces, class_name: 'Piece', foreign_key: 'parent_piece_id', dependent: :destroy

    validates :title, presence: true, length: { minimum: 1, maximum: 300 }
    validate :has_material

    def has_material
        unless images.attached? || content.present? || youtube_url.present?
            errors.add(:base, 'A piece must have at least one image, content, or YouTube URL')
        end
    end
end