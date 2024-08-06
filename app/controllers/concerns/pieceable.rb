module Pieceable
  extend ActiveSupport::Concern

  def calculate_piece_score(piece)
    upvotes = piece.votes.where(vote_type: 1).count
    downvotes = piece.votes.where(vote_type: -1).count
    upvotes - downvotes
  end
end
