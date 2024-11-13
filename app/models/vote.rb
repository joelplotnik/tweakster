class Vote < ApplicationRecord
  belongs_to :user
  belongs_to :challenge

  validates :vote_type,
            inclusion: { in: [1, -1], message: 'is not a valid vote type. Please choose 1 (upvote) or -1 (downvote).' }, presence: true
  validates_uniqueness_of :user_id, scope: :challenge_id, message: 'has already voted on this challenge'

  after_create :update_upvotes_and_downvotes
  after_update :update_upvotes_and_downvotes
  after_destroy :update_upvotes_and_downvotes

  private

  def update_upvotes_and_downvotes
    return unless challenge.present?

    upvotes = challenge.votes.where(vote_type: 1).count
    downvotes = challenge.votes.where(vote_type: -1).count
    challenge.update_columns(upvotes:, downvotes:)
  end
end
