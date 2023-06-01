class Api::V1::PiecesController < ApplicationController
  before_action :authenticate_user!, only: [:create]

  def index
    pieces = Piece.paginate(page: params[:page], per_page: 5).order(created_at: :desc)
    render json: pieces, include: { user: { only: [:id, :username] } }
  end

  def show
    piece = Piece.includes(:user).find(params[:id])
    render json: piece, include: { user: { only: [:id, :username] } }
  end

  def create
    piece = Piece.new(piece_params)
    piece.user = current_user

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
    piece.destroy
  end

  private

  def piece_params
    params.require(:piece).permit(:title, :content)
  end
end
