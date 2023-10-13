class Channel < ApplicationRecord
    include Channelable
    
    belongs_to :user

    has_one_attached :visual
    has_many :pieces
    has_many :subscriptions, dependent: :destroy
    has_many :subscribers, through: :subscriptions, source: :user

    validates :name, presence: true, length: { minimum: 3, maximum: 25 }, uniqueness: { case_sensitive: false }
    validates :url, presence: true, length: { minimum: 3, maximum: 74 }
    validates :protocol, presence: true, length: { minimum: 3, maximum: 200 }
end