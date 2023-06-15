class Piece < ApplicationRecord
    belongs_to :user
    belongs_to :channel
    validates :title, presence: true, length: { minimum: 5, maximum: 100 }
    validates :content, presence: true, length: { minimum: 10, maximum: 2000 }
end
