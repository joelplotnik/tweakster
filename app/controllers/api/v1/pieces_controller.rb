class Api::V1::PiecesController < ApplicationController
  load_and_authorize_resource
  before_action :authenticate_user!, except: [:index, :show]

  rescue_from CanCan::AccessDenied do |exception|
    render json: { warning: exception }, status: :unauthorized
  end

  def index
    channel = Channel.find(params[:channel_id])
    pieces = channel.pieces.paginate(page: params[:page], per_page: 5).order(created_at: :desc)
    render json: pieces, include: { user: { only: [:id, :username] } }
  end

  def show
      piece = Piece.includes(:user, :channel, :comments).find(params[:id])

      render json: piece, include: { 
        user: { only: [:username] },
        channel: { only: [:name] },
        comments: { only: [:message, :created_at], include: { user: { only: [:username] } } }
      }
  end

  def create
    piece = Piece.new(piece_params)
    piece.user = current_user
    piece.channel_id = params[:channel_id]

    if piece.save
      render json: piece, include: { user: { only: [:id, :username] } }, status: :created
    else
      render json: { errors: piece.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    piece = Piece.find(params[:id])

    if piece.update(piece_params)
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
    params.require(:piece).permit(:title, :content)
  end
end