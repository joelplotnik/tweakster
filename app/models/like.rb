class Like < ApplicationRecord
  belongs_to :user
  belongs_to :likeable, polymorphic: true

  validates :user_id, uniqueness: { scope: %i[likeable_type likeable_id] }

  after_create :increment_likeable_count
  after_destroy :decrement_likeable_count

  private

  def increment_likeable_count
    likeable.with_lock do
      likeable.increment!(:likes_count)
    end
  end

  def decrement_likeable_count
    likeable.with_lock do
      likeable.decrement!(:likes_count)
    end
  end
end
