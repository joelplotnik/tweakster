class Api::V1::CommentsController < ApplicationController
  load_and_authorize_resource except: :index
  before_action :authenticate_user!, except: [:index, :show]

  rescue_from CanCan::AccessDenied do |exception|
    render json: { warning: exception }, status: :unauthorized
  end

  def index
    piece = Piece.find(params[:piece_id])
    comments = piece.comments.includes(:user)

    render json: comments, include: { user: { only: [:username] } }
  end

  def create
    comment = Comment.new(comment_params)
    comment.user = current_user

    if comment.save
      render json: comment, status: :created
    else
      render json: { error: comment.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    comment = Comment.find(params[:id])

    if comment.destroy
      render json: { message: 'Comment successfully deleted' }, status: :ok
    else
      render json: { error: 'Failed to delete comment' }, status: :unprocessable_entity
    end
  end

  private

  def comment_params
    params.require(:comment).permit(:message, :piece_id, :parent_comment_id)
  end
end
