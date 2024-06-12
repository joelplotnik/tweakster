class Comment < ApplicationRecord
    belongs_to :user
    belongs_to :piece, counter_cache: true
    belongs_to :parent_comment, class_name: 'Comment', optional: true
    
    has_many :votes, as: :votable
    has_many :child_comments, class_name: 'Comment', foreign_key: 'parent_comment_id', dependent: :destroy
  
    validates :user_id, presence: true
    validates :piece_id, presence: true
    validates :message, presence: true, length: { minimum: 1, maximum: 2200 }
    validate :parent_comment_depth

    private

    def parent_comment_depth
      if parent_comment.present? && parent_comment.parent_comment.present?
        errors.add(:parent_comment, "can only be a top-level comment or a reply to a top-level comment")
      end
    end
  end
  