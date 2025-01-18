class Attempt < ApplicationRecord
  belongs_to :user
  belongs_to :challenge

  has_many :comments, as: :commentable, dependent: :destroy
  has_many :approvals, dependent: :destroy

  validates :user_id, uniqueness: { scope: :challenge_id }
  validates :status, inclusion: { in: ['Pending', 'In Progress', 'Complete'] }

  validate :single_in_progress_attempt, if: -> { status == 'In Progress' }

  def comments_count
    comments.size
  end

  def approvals_count
    approvals.size
  end

  private

  def single_in_progress_attempt
    return unless Attempt.where(user_id:, status: 'In Progress').where.not(id:).exists?

    errors.add(:status, 'Only one attempt can be "In Progress" at a time.')
  end
end
