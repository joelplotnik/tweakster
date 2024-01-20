class Vote < ApplicationRecord
    include Userable
    belongs_to :user
    belongs_to :votable, polymorphic: true
  
    validates :vote_type, inclusion: { in: [1, -1], message: "is not a valid vote type. Please choose 1 or -1." }, presence: true
    validates_uniqueness_of :user_id, scope: [:votable_type, :votable_id], message: "has already voted on this piece or comment"
  
    after_create :update_likes_and_dislikes_and_integrity
    after_update :update_likes_and_dislikes_and_integrity
    after_destroy :update_likes_and_dislikes_and_integrity
  
    private
  
    def update_likes_and_dislikes_and_integrity
      if votable.present?
        likes = votable.votes.where(vote_type: 1).count
        dislikes = votable.votes.where(vote_type: -1).count
  
        votable.update_columns(likes: likes, dislikes: dislikes)
  
        # Update integrity for the user whose piece or comment received the vote
        votable_user = votable.user
        votable_user&.calculate_integrity
        votable_user&.save
      end
    end
  end