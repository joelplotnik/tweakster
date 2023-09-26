class Piece < ApplicationRecord
    belongs_to :user
    belongs_to :channel
    belongs_to :parent_piece, class_name: 'Piece', counter_cache: :tweaks_count, optional: true

    has_many_attached :images
    has_many :votes, as: :votable
    has_many :comments, dependent: :destroy
    has_many :child_pieces, class_name: 'Piece', foreign_key: 'parent_piece_id', dependent: :destroy

    validates :title, presence: true, length: { minimum: 1, maximum: 300 }
    validate :content_length_within_limit

    def content_length_within_limit
        return if content.nil?

        plain_text_content = Sanitize.fragment(content)

        if plain_text_content.length < 10 || plain_text_content.length > 40000
            errors.add(:content, 'must be between 10 and 2500 characters without HTML tags')
        end
    end
end