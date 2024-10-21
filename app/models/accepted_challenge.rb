class AcceptedChallenge < ApplicationRecord
  belongs_to :user
  belongs_to :challenge

  has_many :comments, as: :commentable, dependent: :destroy
  has_many :approvals, dependent: :destroy

  validates :user_id, uniqueness: { scope: :challenge_id }
  validates :status, inclusion: { in: ['To Do', 'In Progress', 'Complete'] }

  after_create :increment_accepted_count
  after_destroy :decrement_accepted_count

  private

  def increment_accepted_count
    challenge.increment!(:accepted_count)
  end

  def decrement_accepted_count
    challenge.decrement!(:accepted_count)
  end
end
