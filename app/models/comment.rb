class Comment < ApplicationRecord
    belongs_to :user
    belongs_to :piece
    belongs_to :parent_comment, class_name: 'Comment', optional: true
    
    has_many :child_comments, class_name: 'Comment', foreign_key: 'parent_comment_id', dependent: :destroy
    has_many :votes, as: :votable
  
    validates :user_id, presence: true
    validates :piece_id, presence: true
    validates :message, presence: true, length: { minimum: 5, maximum: 100 }
  end
  