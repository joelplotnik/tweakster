class Subscription < ApplicationRecord
    belongs_to :user
    belongs_to :channel
    
    validates :user_id, uniqueness: { scope: :channel_id, message: "Already subscribed to channel" }

    after_create :increment_total_users
    after_destroy :decrement_total_users

    private

    def increment_total_users
      channel.increment!(:total_users)
    end

    def decrement_total_users
      channel.decrement!(:total_users)
    end
  end