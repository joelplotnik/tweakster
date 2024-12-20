require 'will_paginate/array'

class Api::V1::CommentsController < ApplicationController
  skip_before_action :verify_authenticity_token, raise: false
  before_action :authenticate_devise_api_token!, only: %i[create update destroy]

  def index
    comments = Comment.where(commentable: find_commentable, parent_id: nil)
                      .includes(user: { avatar_attachment: :blob })
                      .order(likes_count: :desc)

    per_page = 10
    page = params[:page].to_i.positive? ? params[:page].to_i : 1
    paginated_comments = comments.offset((page - 1) * per_page).limit(per_page)

    comments_with_replies_count = paginated_comments.map do |comment|
      formatted_comment = format_comment(comment)
      formatted_comment.merge('replies_count' => comment.children.count)
    end

    render json: comments_with_replies_count
  end

  def replies
    parent_comment = Comment.find(params[:id])

    replies = parent_comment.children.includes(user: { avatar_attachment: :blob }).order(likes_count: :desc)

    per_page = 10
    page = params[:page].to_i.positive? ? params[:page].to_i : 1
    paginated_replies = replies.offset((page - 1) * per_page).limit(per_page)

    remaining_replies = replies.count - (page * per_page)

    replies_json = paginated_replies.map { |reply| format_comment(reply) }

    render json: {
      replies: replies_json,
      remaining_replies: [remaining_replies, 0].max
    }
  end

  def create
    commentable = find_commentable
    comment = commentable.comments.new(comment_params)
    comment.user = current_user

    comment.parent_id = params[:id] if params[:id].present?

    if comment.save
      CommentNotifier.with(record: comment).deliver(commentable.user) unless comment.user == commentable.user

      render json: comment, include: {
        user: { only: %i[username slug], methods: [:avatar_url] }
      }, status: :created
    else
      render json: { error: comment.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    comment = Comment.find(params[:id])

    if comment.update(comment_params.except(:parent_id))
      render json: comment, include: {
        user: { only: [:username], methods: [:avatar_url] }
      }, status: :ok
    else
      render json: { error: comment.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    comment = Comment.find(params[:id])

    if comment.user == current_user || comment.commentable.user == current_user
      comment.destroy

      if comment.destroyed?
        render json: { message: 'Comment successfully deleted' }, status: :ok
      else
        render json: { error: 'Failed to delete comment' }, status: :unprocessable_entity
      end
    else
      render json: { error: 'Unauthorized to delete this comment' }, status: :unauthorized
    end
  end

  private

  def comment_params
    params.require(:comment).permit(:message, :commentable_id, :commentable_type)
  end

  def find_commentable
    if params[:challenge_id]
      Challenge.find(params[:challenge_id])
    elsif params[:attempt_id]
      Attempt.find(params[:attempt_id])
    else
      render json: { error: 'Commentable not found' }, status: :not_found
    end
  end

  def format_comment(comment)
    comment.as_json.merge({
                            user: {
                              username: comment.user.username,
                              slug: comment.user.slug,
                              avatar_url: comment.user.avatar.attached? ? url_for(comment.user.avatar) : nil
                            }
                          })
  end
end
