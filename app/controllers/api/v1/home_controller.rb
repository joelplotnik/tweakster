class Api::V1::HomeController < ApplicationController
    def index
      pieces = Piece.select('pieces.*, COALESCE(SUM(votes.vote_type), 0) AS score')
                    .left_joins(:votes)
                    .group('pieces.id')
                    .order('score DESC')
                    .paginate(page: params[:page], per_page: 5)
  
      render json: pieces, include: { 
        user: { only: [:id, :username] },
        channel: { only: [:id, :name] },
        votes: { only: [:user_id, :vote_type] }
      }
    end
  end
  