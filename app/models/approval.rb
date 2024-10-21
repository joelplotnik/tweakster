class Approval < ApplicationRecord
  belongs_to :accepted_challenge
  belongs_to :user

  validates :user_id, uniqueness: { scope: :accepted_challenge_id }

  after_create :increment_approvals_count
  after_destroy :decrement_approvals_count

  private

  def increment_approvals_count
    accepted_challenge.with_lock do
      accepted_challenge.increment!(:approvals_count)
    end
  end

  def decrement_approvals_count
    accepted_challenge.with_lock do
      accepted_challenge.decrement!(:approvals_count)
    end
  end
end
