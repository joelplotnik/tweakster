class Piece < ApplicationRecord
    belongs_to :user
    belongs_to :channel

    # belongs_to :parent_piece, class_name: 'Piece', optional: true
    # has_many :child_pieces, class_name: 'Piece', foreign_key: 'parent_piece_id'
    # # With these associations in plaec you can do something like
    # piece = Piece.find(1)
    # child_pieces = piece.child_pieces
    # parent_piece = piece.parent_piece
    # # You must all add parent_piece_id column to pieces
    # rails generate migration AddParentPieceToPieces parent_piece:references

    has_many :comments, dependent: :destroy

    validates :title, presence: true, length: { minimum: 5, maximum: 100 }
    validates :content, presence: true, length: { minimum: 10, maximum: 2000 }
end
