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

    paginated_pieces = sorted_pieces.paginate(page: params[:page], per_page: 10)

    pieces_with_images = paginated_pieces.map do |piece|
      image_urls = piece.images.map { |image| url_for(image) }

      parent_piece_info = get_parent_piece_info(piece.parent_piece_id)

      piece.as_json(include: {
        user: {
          only: [:id, :username],
          methods: [:avatar_url] 
        },
        channel: { only: [:id, :name] },
        votes: { only: [:user_id, :vote_type] }
      }).merge({ 
        images: image_urls,
        parent_piece: parent_piece_info
      })
    end

    render json: pieces_with_images
  end

  def mischief_makers
    pieces_with_images = [] # Initialize an array to store pieces with images.
  
    current_day = Date.current
    days_to_look_back = 0
  
    # Continue searching until there at least 4 pieces with images.
    while pieces_with_images.length < 4
      target_day = current_day - days_to_look_back.days
  
      # Query the database to find pieces on the target day with the most votes.
      pieces = Piece
        .left_joins(:votes)
        .where(votes: { votable_type: 'Piece' })
        .where('votes.created_at >= ? AND votes.created_at < ?', target_day.beginning_of_day, (target_day + 1.day).beginning_of_day)
        .group('pieces.id')
        .order('SUM(votes.vote_type) DESC')
        .limit(4 - pieces_with_images.length)
  
      # Filter the pieces to include only those with images attached.
      pieces = pieces.select { |piece| piece.images.attached? }
  
      # Add the selected pieces to the result array.
      pieces_with_images.concat(pieces)
  
      days_to_look_back += 1
    end
  
    # Convert the pieces to JSON and retrieve image URLs.
    pieces_with_images.map! do |piece|
      image_urls = piece.images.map { |image| url_for(image) }
  
      piece.as_json(include: {
        user: { only: [:id, :username], methods: [:avatar_url] },
        channel: { only: [:id, :name] },
        votes: { only: [:user_id, :vote_type] }
      }).merge(images: image_urls)
    end
  
    # Render the resulting JSON with user information included.
    render json: pieces_with_images, include: { user: { only: [:id, :username] } }
  end
  
  
end
