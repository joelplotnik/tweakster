module Pieceable
    extend ActiveSupport::Concern
  
    def calculate_piece_score(piece)
      likes = piece.votes.where(vote_type: 1).count
      dislikes = piece.votes.where(vote_type: -1).count
      likes - dislikes
    end

    def get_parent_piece_info(parent_piece_id)
      if parent_piece_id
        parent_piece_data = Piece.find(parent_piece_id)
        parent_piece_user = {
          id: parent_piece_data.user.id,
          username: parent_piece_data.user.username
        }
        parent_piece_channel = {
          id: parent_piece_data.channel.id
        }
        parent_piece = {
          title: parent_piece_data.title,
          likes: parent_piece_data.likes,
          dislikes: parent_piece_data.dislikes,
          user: parent_piece_user,
          channel: parent_piece_channel
        }
      end
    end
  
  end
  