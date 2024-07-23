class Vote < ApplicationRecord
  include Userable
  belongs_to :user
  belongs_to :votable, polymorphic: true

  validates :vote_type, inclusion: { in: [1, -1], message: 'is not a valid vote type. Please choose 1 or -1.' },
                        presence: true
  validates_uniqueness_of :user_id, scope: %i[votable_type votable_id],
                                    message: 'has already voted on this piece or comment'

  after_create :update_upvotes_and_downvotes_and_integrity
  after_update :update_upvotes_and_downvotes_and_integrity
  after_destroy :update_upvotes_and_downvotes_and_integrity

  private

  def update_upvotes_and_downvotes_and_integrity
    return unless votable.present?

    upvotes = votable.votes.where(vote_type: 1).count
    downvotes = votable.votes.where(vote_type: -1).count

    votable.update_columns(upvotes:, downvotes:)

    # Update integrity for the user whose piece, tweak, or comment received the vote
    votable_user = votable.user
    votable_user&.calculate_integrity
    votable_user&.save
  end
end
