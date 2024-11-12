class Like < ApplicationRecord
  belongs_to :user
  belongs_to :comment

  validates :user_id, uniqueness: { scope: :comment_id }

  after_create :increment_comment_like_count
  after_destroy :decrement_comment_like_count

  private

  def increment_comment_like_count
    comment.with_lock do
      comment.increment!(:likes_count)
    end
  end

  def decrement_comment_like_count
    comment.with_lock do
      comment.decrement!(:likes_count)
    end
  end
end
