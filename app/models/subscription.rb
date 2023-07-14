class Subscription < ApplicationRecord
    belongs_to :user
    belongs_to :channel, counter_cache: true
    
    validates :user_id, uniqueness: { scope: :channel_id, message: "Already subscribed to channel" }
  end