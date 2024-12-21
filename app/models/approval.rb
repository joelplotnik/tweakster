class Approval < ApplicationRecord
  belongs_to :attempt
  belongs_to :user

  validates :user_id, uniqueness: { scope: :attempt_id }
end
