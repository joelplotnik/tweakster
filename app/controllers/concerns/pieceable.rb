module Pieceable
  extend ActiveSupport::Concern

  def calculate_piece_score(piece)
    upvotes = piece.votes.where(vote_type: 1).count
    downvotes = piece.votes.where(vote_type: -1).count
    upvotes - downvotes
  end

  def calculate_piece_votes(piece)
    upvotes = piece.upvotes
    downvotes = piece.downvotes
    upvotes + downvotes
  end
end
