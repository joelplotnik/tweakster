module Pieceable
    extend ActiveSupport::Concern
  
    def calculate_piece_score(piece)
      likes = piece.votes.where(vote_type: 1).count
      dislikes = piece.votes.where(vote_type: -1).count
      likes - dislikes
    end

    def calculate_piece_votes(piece)
      likes = piece.likes
      dislikes = piece.dislikes
      likes + dislikes
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

    def get_highest_scoring_tweak_piece(piece)
      parent_score = calculate_piece_score(piece)
      parent_votes = calculate_piece_votes(piece)
  
      highest_score_tweaked_piece = Piece.where(parent_piece_id: piece.id)
                                        .select { |tweaked_piece| calculate_piece_score(tweaked_piece) > parent_score }
                                        .max_by { |tweaked_piece| calculate_piece_score(tweaked_piece) }
  
      if highest_score_tweaked_piece && calculate_piece_votes(highest_score_tweaked_piece) >= parent_votes
        {
          user: {
            username: highest_score_tweaked_piece.user.username,
            id: highest_score_tweaked_piece.user.id
          },
          piece_id: highest_score_tweaked_piece.id,
          channel_id: highest_score_tweaked_piece.channel.id,
          vote_difference: calculate_piece_score(highest_score_tweaked_piece) - parent_score
        }
      else
        {}
      end
    end    
end
  