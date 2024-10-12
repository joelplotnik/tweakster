require 'will_paginate/array'

class Api::V1::CommentsController < ApplicationController
  include Commentable

  before_action :authenticate_user!, except: %i[index show]
  load_and_authorize_resource except: %i[index]

  rescue_from CanCan::AccessDenied do |exception|
    render json: { warning: exception }, status: :unauthorized
  end

  def index
    comments = Comment.where(commentable: find_commentable, parent_id: nil)
                      .includes(:user)
                      .order(likes_count: :desc)

    per_page = 10
    page = params[:page].to_i.positive? ? params[:page].to_i : 1
    paginated_comments = comments.offset((page - 1) * per_page).limit(per_page)

    comments_with_replies_count = paginated_comments.map do |comment|
      {
        comment:,
        replies_count: comment.children.count
      }
    end

    render json: comments_with_replies_count, include: {
      user: { only: [:username], methods: [:avatar_url] }
    }
  end

  def replies
    parent_comment = Comment.find(params[:parent_comment_id])
    replies = parent_comment.children.includes(:user).order(likes_count: :desc)

    per_page = 10
    page = params[:page].to_i.positive? ? params[:page].to_i : 1
    paginated_replies = replies.offset((page - 1) * per_page).limit(per_page)

    render json: {
      replies: paginated_replies,
      replies_count: replies.count
    }, include: {
      user: { only: [:username], methods: [:avatar_url] }
    }
  end

  def create
    commentable = find_commentable
    comment = commentable.comments.new(comment_params)
    comment.user = current_user

    comment.parent_id = params[:parent_id] if params[:parent_id].present?

    if comment.save
      CommentNotifier.with(record: comment).deliver(commentable.user) unless comment.user == comment.commentable.user

      render json: comment, include: {
        user: { only: [:username], methods: [:avatar_url] },
        likes: { only: [:user_id] }
      }, status: :created
    else
      render json: { error: comment.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    comment = Comment.find(params[:id])

    if comment.update(comment_params.except(:parent_id))
      render json: comment, include: {
        user: { only: [:username], methods: [:avatar_url] },
        likes: { only: [:user_id] }
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
    if params[:challenge_id]
      Challenge.find(params[:challenge_id])
    elsif params[:accepted_challenge_id]
      AcceptedChallenge.find(params[:accepted_challenge_id])
    else
      render json: { error: 'Commentable not found' }, status: :not_found
    end
  end

  def comment_params
    params.require(:comment).permit(:message, :commentable_id, :commentable_type)
  end
end
