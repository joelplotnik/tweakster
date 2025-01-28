class Api::V1::CommentsController < ApplicationController
  skip_before_action :verify_authenticity_token, raise: false
  before_action :authenticate_devise_api_token!, only: %i[create destroy]
  before_action :authenticate_devise_api_token_if_present!, only: %i[index replies]

  def index
    comments = Comment.where(commentable: find_commentable, parent_id: nil)
                      .includes(user: { avatar_attachment: :blob })
                      .order(likes_count: :desc)

    excluded_comment_ids = JSON.parse(params[:exclude] || '[]')
    comments = comments.where.not(id: excluded_comment_ids)

    paginated_comments = comments.paginate(page: params[:page], per_page: 10)

    user_likes = if current_user
                   Like.where(user: current_user, comment_id: paginated_comments.pluck(:id)).pluck(:comment_id)
                 else
                   []
                 end
    user_likes_set = user_likes.to_set

    comments_with_replies_count = paginated_comments.map do |comment|
      formatted_comment = format_comment(comment)
      formatted_comment.merge(
        'replies_count' => comment.children.count,
        'user_liked' => user_likes_set.include?(comment.id)
      )
    end

    render json: comments_with_replies_count
  end

  def replies
    parent_comment = Comment.find(params[:id])

    excluded_reply_ids = JSON.parse(params[:exclude] || '[]')

    replies = parent_comment.children
                            .where.not(id: excluded_reply_ids)
                            .includes(user: { avatar_attachment: :blob })
                            .order(likes_count: :desc)

    paginated_replies = replies.paginate(page: params[:page], per_page: 10)

    user_likes = if current_user
                   Like.where(user: current_user, comment_id: paginated_replies.pluck(:id)).pluck(:comment_id)
                 else
                   []
                 end
    user_likes_set = user_likes.to_set

    replies_json = paginated_replies.map do |reply|
      format_comment(reply).merge('user_liked' => user_likes_set.include?(reply.id))
    end

    total_replies = replies.count
    replies_shown = paginated_replies.current_page * paginated_replies.per_page
    remaining_replies = [total_replies - replies_shown, 0].max

    render json: {
      replies: replies_json,
      remaining_replies:
    }
  end

  def create
    commentable = find_commentable
    comment = commentable.comments.new(comment_params)
    comment.user = current_user

    if comment.save
      if comment.parent_id.present?
        parent_comment = Comment.find(comment.parent_id)
        CommentNotifier.with(record: comment).deliver(parent_comment.user) unless parent_comment.user == current_user
      else
        CommentNotifier.with(record: comment).deliver(commentable.user) unless comment.user == commentable.user
      end

      formatted_comment = format_comment(comment)
      formatted_comment['replies_count'] = comment.children.count
      formatted_comment['user_liked'] = false

      render json: formatted_comment, status: :created
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
    params.require(:comment).permit(:message, :commentable_id, :commentable_type, :parent_id)
  end

  def find_commentable
    if params[:attempt_id]
      Attempt.find(params[:attempt_id])
    elsif params[:challenge_id]
      Challenge.find(params[:challenge_id])
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
