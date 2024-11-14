class Approval < ApplicationRecord
  belongs_to :attempt
  belongs_to :user

  validates :user_id, uniqueness: { scope: :attempt_id }

  after_create :increment_approvals_count
  after_destroy :decrement_approvals_count

  private

  def increment_approvals_count
    attempt.with_lock do
      attempt.increment!(:approvals_count)
    end
  end

  def decrement_approvals_count
    attempt.with_lock do
      attempt.decrement!(:approvals_count)
    end
  end
end
