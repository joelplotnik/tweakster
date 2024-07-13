require 'will_paginate/array'

class Api::V1::CommentsController < Api::V1::ApplicationController
  include Commentable

  load_and_authorize_resource except: :index
  before_action :authenticate_user!, except: [:index, :show]

  rescue_from CanCan::AccessDenied do |exception|
    render json: { warning: exception }, status: :unauthorized
  end

  def index
    piece = Piece.find(params[:piece_id])
    comments = piece.comments.includes(:user, :votes)

    excluded_comment_ids = JSON.parse(params[:exclude])
    comments = comments.where.not(id: excluded_comment_ids)

    if params[:sort] == 'new'
      comments = comments.order(created_at: :desc)
    else
      comments = comments.sort_by { |comment| calculate_comment_score(comment) }.reverse
    end

    root_comments = comments.select { |comment| comment.parent_comment_id.nil? }
    comments_with_children = root_comments.map { |comment| build_comment_tree(comment, sort_by_score: params[:sort] != 'new') }
    paginated_comments = comments_with_children.paginate(page: params[:page], per_page: 10)

    render json: paginated_comments, include: {
      user: { only: [:username] },
      votes: { only: [:user_id, :vote_type] },
      child_comments: {
        include: {
          user: { only: [:username] },
          votes: { only: [:user_id, :vote_type] }
        }
      }
    }
  end

  def create
    comment = Comment.new(comment_params)
    comment.user = current_user
  
    if comment.save
      unless comment.user == comment.piece.user
        CommentOnPieceNotifier.with(record: comment).deliver(comment.piece.user)
      end
      
      render json: build_comment_tree(comment), include: {
        user: { only: [:username] },
        votes: { only: [:user_id, :vote_type] },
        child_comments: {
          include: {
            user: { only: [:username] },
            votes: { only: [:user_id, :vote_type] }
          }
        }
      }, status: :created
    else
      render json: { error: comment.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    comment = Comment.find(params[:id])

    if comment.update(comment_params)
      render json: build_comment_tree(comment), include: {
        user: { only: [:username] },
        votes: { only: [:user_id, :vote_type] },
        child_comments: {
          include: {
            user: { only: [:username] },
            votes: { only: [:user_id, :vote_type] }
          }
        }
      }, status: :created
    else
      render json: { error: comment.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    comment = Comment.find(params[:id])
    comment.destroy
  
    if comment.destroyed?
      render json: { message: 'Comment and its children successfully deleted' }, status: :ok
    else
      render json: { error: 'Failed to delete comment' }, status: :unprocessable_entity
    end
  end

  def check_ownership
    comment = Comment.find(params[:id])
    belongs_to_user = comment.user == current_user || current_user.admin?
    render json: { belongs_to_user: belongs_to_user }
  end

  private

  def comment_params
    params.require(:comment).permit(:message, :piece_id, :parent_comment_id)
  end
end
