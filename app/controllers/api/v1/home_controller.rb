class Api::V1::HomeController < ApplicationController
    def index
        pieces = Piece.paginate(page: params[:page], per_page: 5).order(created_at: :desc)
        render json: pieces, include: { 
            user: { only: [:id, :username] },
            channel: { only: [:id, :name] }
        }
      end
end
  