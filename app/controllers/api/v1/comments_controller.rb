require 'will_paginate/array'

class Api::V1::CommentsController < ApplicationController
  include Commentable

  before_action :authenticate_user!, except: %i[index show]
  load_and_authorize_resource except: %i[index]

  rescue_from CanCan::AccessDenied do |exception|
    render json: { warning: exception }, status: :unauthorized
  end

  def index
    comments = Comment.where(commentable: find_commentable)
                      .includes(:user, :votes)

    excluded_comment_ids = JSON.parse(params[:exclude] || '[]')
    comments = comments.where.not(id: excluded_comment_ids)

    comments = if params[:sort] == 'new'
                 comments.order(created_at: :desc)
               else
                 comments.sort_by { |comment| calculate_comment_score(comment) }.reverse
               end

    total_comments = comments.count
    per_page = 5
    page = params[:page] || 1

    if params[:load_all] == 'true'
      comments_to_send = comments.drop(per_page)
      paginated_comments = comments_to_send
      comments_left = [total_comments - (per_page * (page.to_i - 1)), 0].max
      more_comments = false
    else
      paginated_comments = comments.paginate(page:, per_page:)
      comments_left = [total_comments - (page.to_i * per_page), 0].max
      more_comments = paginated_comments.next_page.present?
    end

    render json: {
      comments: paginated_comments,
      meta: {
        has_more: more_comments,
        comments_left:
      }
    }, include: {
      user: { only: [:username], methods: [:avatar_url] },
      votes: { only: %i[user_id vote_type] }
    }
  end

  def create
    commentable = find_commentable
    comment = commentable.comments.new(comment_params)
    comment.user = current_user

    if comment.save
      unless comment.user == comment.commentable.user
        CommentOnPieceNotifier.with(record: comment).deliver(commentable.user)
      end

      render json: comment, include: {
        user: { only: [:username], methods: [:avatar_url] },
        votes: { only: %i[user_id vote_type] }
      }, status: :created
    else
      render json: { error: comment.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    comment = Comment.find(params[:id])

    if comment.update(comment_params)
      render json: comment, include: {
        user: { only: [:username], methods: [:avatar_url] },
        votes: { only: %i[user_id vote_type] }
      }, status: :ok
    else
      render json: { error: comment.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    comment = Comment.find(params[:id])
    comment.destroy

    if comment.destroyed?
      render json: { message: 'Comment successfully deleted' }, status: :ok
    else
      render json: { error: 'Failed to delete comment' }, status: :unprocessable_entity
    end
  end

  def check_ownership
    comment = Comment.find(params[:id])
    belongs_to_user = comment.user == current_user || current_user.admin?
    render json: { belongs_to_user: }
  end

  private

  def find_commentable
    if params[:tweak_id]
      Tweak.find(params[:tweak_id])
    elsif params[:piece_id]
      Piece.find(params[:piece_id])
    end
  end

  def comment_params
    params.require(:comment).permit(:message, :commentable_id, :commentable_type)
  end
end
