class Attempt < ApplicationRecord
  belongs_to :user
  belongs_to :challenge

  has_many :comments, as: :commentable, dependent: :destroy
  has_many :approvals, dependent: :destroy

  validates :user_id, uniqueness: { scope: :challenge_id }
  validates :status, inclusion: { in: ['Pending', 'In Progress', 'Complete'] }

  validate :single_in_progress_attempt, if: -> { status == 'In Progress' }

  validates :twitch_video_link, presence: true, if: -> { status == 'Complete' }
  validates :twitch_video_link, format: {
    with: %r{\Ahttps://www\.twitch\.tv/videos/[A-Za-z0-9_-]+\z},
    message: 'must be a valid Twitch video link'
  }, allow_nil: true

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
