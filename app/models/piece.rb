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
    validate :valid_youtube_url, if: -> { youtube_url.present? }
  
    def has_material
      unless images.attached? || content.present? || youtube_url.present?
        errors.add(:base, 'A piece must have at least one image, content, or YouTube URL')
      end
    end
  
    def valid_youtube_url
      unless youtube_url =~ %r{\A(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})\z}
        errors.add(:youtube_url, 'must be a valid YouTube URL')
      end
    end
  end
  