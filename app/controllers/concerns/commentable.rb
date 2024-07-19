module Commentable
  extend ActiveSupport::Concern

  def calculate_comment_score(comment)
    upvotes = comment.votes.where(vote_type: 1).count
    downvotes = comment.votes.where(vote_type: -1).count
    upvotes - downvotes
  end
end
