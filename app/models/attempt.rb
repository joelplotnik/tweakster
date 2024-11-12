class Attempt < ApplicationRecord
  belongs_to :user
  belongs_to :challenge

  has_many :comments, as: :commentable, dependent: :destroy
  has_many :approvals, dependent: :destroy

  validates :user_id, uniqueness: { scope: :challenge_id }
  validates :status, inclusion: { in: ['To Do', 'In Progress', 'Complete'] }

  after_create :increment_attempt_count
  after_destroy :decrement_attempt_count

  private

  def increment_attempt_count
    challenge.increment!(:attempt_count)
  end

  def decrement_attempt_count
    challenge.decrement!(:attempt_count)
  end
end
