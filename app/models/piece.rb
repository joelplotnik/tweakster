class Piece < ApplicationRecord
    belongs_to :user
    belongs_to :channel
    belongs_to :parent_piece, class_name: 'Piece', counter_cache: :tweaks_count, optional: true

    has_many :votes, as: :votable
    has_many :comments, dependent: :destroy
    has_many :child_pieces, class_name: 'Piece', foreign_key: 'parent_piece_id', dependent: :destroy

    validates :title, presence: true, length: { minimum: 5, maximum: 100 }
    validates :content, presence: true, length: { minimum: 10, maximum: 2000 }
end
