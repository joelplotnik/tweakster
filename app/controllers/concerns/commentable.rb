module Commentable
  extend ActiveSupport::Concern

  def calculate_comment_score(comment)
    likes = comment.votes.where(vote_type: 1).count
    dislikes = comment.votes.where(vote_type: -1).count
    likes - dislikes
  end

  def build_comment_tree(comment, sort_by_score: false)
    comment_info = {
      comment:,
      user: comment.user.as_json(only: [:username]),
      votes: comment.votes.as_json(only: %i[user_id vote_type]),
      child_comments: []
    }

    child_comments = comment.child_comments
    if sort_by_score
      child_comments = child_comments.sort_by do |child_comment|
        calculate_comment_score(child_comment)
      end.reverse
    end

    child_comments.each do |child_comment|
      comment_info[:child_comments] << build_comment_tree(child_comment, sort_by_score:)
    end

    comment_info
  end
end
