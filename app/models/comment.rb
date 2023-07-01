class Comment < ApplicationRecord
    belongs_to :user
    belongs_to :piece
  
    validates :user_id, presence: true
    validates :piece_id, presence: true
    validates :message, presence: true, length: { minimum: 5, maximum: 100 }
  end
  