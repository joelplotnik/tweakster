class Approval < ApplicationRecord
  belongs_to :accepted_challenge
  belongs_to :user

  validates :user_id, uniqueness: { scope: :accepted_challenge_id }
end
