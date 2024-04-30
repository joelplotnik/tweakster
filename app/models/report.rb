class Report < ApplicationRecord
    belongs_to :user, foreign_key: :reporter_id

    validates :content_type, presence: true
    validates :content_id, presence: true
    validates :reporter_id, presence: true
    validates :reason, presence: true
    validates :content_type, uniqueness: { scope: [:content_id, :reporter_id], message: "Content has already been reported by this user" }
end
  