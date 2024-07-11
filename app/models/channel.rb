class Channel < ApplicationRecord
    include Channelable

    before_validation :strip_whitespace
  
    belongs_to :user
    has_one_attached :visual
    has_many :pieces
    has_many :subscriptions, dependent: :destroy
    has_many :subscribers, through: :subscriptions, source: :user
  
    validates :name, presence: true,
      length: { minimum: 2, maximum: 25 },
      uniqueness: { case_sensitive: false },
      format: { with: /\A[a-zA-Z0-9_\.]*\z/ }
    validates :url, allow_blank: true,
      length: { minimum: 7, maximum: 74 }
    validates :protocol, allow_blank: true,
      length: { minimum: 2, maximum: 280 }
    validates :summary, allow_blank: true,
      length: { minimum: 2, maximum: 280 }
  
    private
  
    def strip_whitespace
      self.name&.strip!
      self.url&.strip!
      self.protocol&.strip!
      self.summary&.strip!
    end
  end
  