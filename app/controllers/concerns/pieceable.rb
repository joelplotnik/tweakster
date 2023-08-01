module Pieceable
    extend ActiveSupport::Concern
  
    def calculate_piece_score(piece)
      likes = piece.votes.where(vote_type: 1).count
      dislikes = piece.votes.where(vote_type: -1).count
      likes - dislikes
    end
  
  end
  