class Attempt < ApplicationRecord
  belongs_to :user
  belongs_to :challenge

  has_many :comments, as: :commentable, dependent: :destroy
  has_many :approvals, dependent: :destroy

  validates :user_id, uniqueness: { scope: :challenge_id }
  validates :status, inclusion: { in: ['To Do', 'In Progress', 'Complete'] }

  def comments_count
    comments.size
  end

  def approvals_count
    approvals.size
  end
end
