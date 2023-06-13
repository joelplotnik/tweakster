class Channel < ApplicationRecord
    belongs_to :user
    validates :name, presence: true, length: { minimum: 3, maximum: 25 }
    validates :url, presence: true, length: { minimum: 3, maximum: 74 }
    validates :protocol, presence: true, length: { minimum: 3, maximum: 200 }
end