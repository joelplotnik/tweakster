class Comment < ApplicationRecord
    belongs_to :user
    belongs_to :piece, counter_cache: true
    belongs_to :parent_comment, class_name: 'Comment', optional: true
    
    has_many :votes, as: :votable
    has_many :child_comments, class_name: 'Comment', foreign_key: 'parent_comment_id', dependent: :destroy
  
    validates :user_id, presence: true
    validates :piece_id, presence: true
    validates :message, presence: true, length: { minimum: 1, maximum: 100 }
  end
  