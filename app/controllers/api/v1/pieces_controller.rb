require 'will_paginate/array'

class Api::V1::PiecesController < Api::V1::ApplicationController
  include Pieceable
  include Userable
  include Sanitizable

  load_and_authorize_resource
  before_action :authenticate_user!, except: [:index, :show, :tweaks]

  rescue_from CanCan::AccessDenied do |exception|
    render json: { warning: exception }, status: :unauthorized
  end

  def index
    channel = Channel.find(params[:channel_id])
    pieces = channel.pieces.paginate(page: params[:page], per_page: 5).order(created_at: :desc)
    render json: pieces, include: { user: { only: [:id, :username] } }
  end

  def show
    piece = Piece.includes(:user, :channel, :comments, :votes).find(params[:id])

    comments_count = piece.comments.count
    image_urls = piece.images.map { |image| url_for(image) }

    parent_piece = get_parent_piece_info(piece.parent_piece_id)
  
    render json: piece.as_json(include: {
      user: { only: [:id, :username], methods: [:avatar_url] },
      channel: { only: [:id, :name] },
      votes: { only: [:user_id, :vote_type] }
    }).merge({ 
      comments_count: comments_count,
      images: image_urls,
      parent_piece: parent_piece,
     })
  end

  def tweaks
    parent_piece = Piece.includes(:user, :channel).find(params[:id])
    tweaks = parent_piece.child_pieces

    sorted_tweaks = if params[:sort] == 'new'
                      tweaks.order(created_at: :desc)
                    else
                      tweaks.sort_by { |tweak| calculate_piece_score(tweak) }.reverse
                    end

    paginated_tweaks = sorted_tweaks.paginate(page: params[:page], per_page: 5)

    tweaks_with_images = paginated_tweaks.map do |tweak|
      image_urls = tweak.images.map { |image| url_for(image) }

      highest_scoring_tweak_info = get_highest_scoring_tweak_piece(tweak)

      tweak_json = tweak.as_json(include: {
        user: { only: [:id, :username], methods: [:avatar_url] },
        channel: { only: [:id, :name] },
        votes: { only: [:user_id, :vote_type] }
      }).merge(images: image_urls)

      tweak_json.merge!(tweak: highest_scoring_tweak_info) if highest_scoring_tweak_info.present?

      tweak_json
    end
  
    render json: tweaks_with_images
  end

  def create
    channel = Channel.find(params[:channel_id])
    if current_user.subscriptions.exists?(channel: channel)
      piece = Piece.new(piece_params.except(:images))
      sanitized_content = sanitize_rich_content(params[:piece][:content])
      piece.content = sanitized_content

      images = params[:piece][:images]
      if images
        images.each do |image|
          piece.images.attach(image)
        end
      end

      piece.user = current_user
      piece.channel_id = params[:channel_id]

      if piece.save
        if piece.parent_piece_id.present?
          parent_piece = Piece.find_by(id: piece.parent_piece_id)
          if parent_piece && parent_piece.user != current_user
            TweakOfPieceNotifier.with(record: piece).deliver(parent_piece.user)
          end
        end

        render json: piece, include: { user: { only: [:id, :username] } }, status: :created
      else
        render json: { errors: piece.errors.full_messages }, status: :unprocessable_entity
      end
    else
      render json: { error: 'Access denied. You must be subscribed to the channel or an admin to create a piece.' }, status: :forbidden
    end
  end

  def update
    piece = Piece.find(params[:id])

    if piece.tweaks_count > 0
      render json: { error: 'Cannot update piece with tweaks' }, status: :unprocessable_entity
      return
    end

    sanitized_content = sanitize_rich_content(params[:piece][:content])
    piece.content = sanitized_content

    if piece.update(piece_params.except(:images))
      render json: piece, include: { user: { only: [:id, :username] } }, status: :ok
    else
      render json: { errors: piece.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    piece = Piece.find(params[:id])
  
    if piece.destroy
      render json: { message: 'Piece deleted successfully' }
    else
      render json: { error: 'Unable to delete the piece' }, status: :unprocessable_entity
    end
  end

  def check_ownership
    piece = Piece.find(params[:id])
    belongs_to_user = piece.user == current_user || current_user.admin?
    render json: { belongs_to_user: belongs_to_user }
  end

  private

  def piece_params
    params.require(:piece).permit(:title, :content, :youtube_url, :parent_piece_id,  images: [])
  end
end