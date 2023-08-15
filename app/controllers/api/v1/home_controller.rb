require 'will_paginate/array'

class Api::V1::HomeController < ApplicationController
  include Userable
  include Pieceable

  def index
    all_pieces = Piece.all
    sorted_pieces = if params[:sort] == 'new'
                      all_pieces.order(created_at: :desc)
                    else
                      all_pieces.sort_by { |piece| calculate_piece_score(piece) }.reverse
                    end

    paginated_pieces = sorted_pieces.paginate(page: params[:page], per_page: 5)

    render json: paginated_pieces.as_json(include: {
      user: {
        only: [:id, :username],
        methods: [:avatar_url] 
      },
      channel: { only: [:id, :name] },
      votes: { only: [:user_id, :vote_type] }
    })
  end
end
