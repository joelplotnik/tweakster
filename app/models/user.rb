class User < ApplicationRecord
  include Devise::JWT::RevocationStrategies::JTIMatcher
  include Userable

  before_save :calculate_integrity
  
  has_one_attached :avatar
  has_many :subscriptions, dependent: :destroy
  has_many :channels, through: :subscriptions, dependent: :destroy
  has_many :owned_channels, class_name: 'Channel', foreign_key: 'user_id', dependent: :destroy
  has_many :pieces, dependent: :destroy
  has_many :comments, dependent: :destroy
  has_many :votes, dependent: :destroy
  has_many :reports, foreign_key: 'reporter_id'
  has_many :sent_messages, class_name: 'Message', foreign_key: 'sender_id'
  has_many :received_messages, class_name: 'Message', foreign_key: 'receiver_id'

  serialize :favorite_users, Array
  serialize :favorite_channels, Array

  # Users you follow
  has_many :followed_users, foreign_key: :follower_id,
  class_name: 'Relationship', dependent: :destroy
  has_many :followees, through: :followed_users, dependent: :destroy

  # Users following you
  has_many :following_users, foreign_key: :followee_id,
  class_name: 'Relationship', dependent: :destroy
  has_many :followers, through: :following_users, dependent: :destroy

  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable,
         :database_authenticatable, :jwt_authenticatable, 
         jwt_revocation_strategy: self

  validates :username, presence: true, 
         uniqueness: { case_sensitive: false }, 
         length: { minimum: 2, maximum: 25 },
         format: { with: /^[a-zA-Z0-9_\.]*$/, multiline: true }
  validates :url, allow_blank: true, length: { minimum: 7, maximum: 74 }
  validates :bio, allow_blank: true, length: { minimum: 2, maximum: 280 }
  validate :validate_favorite_channels_count
  validate :validate_favorite_users_count

  ROLES = %w{admin moderator advertiser user}
  
  # Create methods at runtime for users (meta programming)
  ROLES.each do |role_name|
    define_method "#{role_name}?" do
      role == role_name
    end
  end

  attr_writer :login
  validate :validate_username

  def login
    login || username || email
  end

  def self.find_for_database_authentication(warden_conditions)
    conditions = warden_conditions.dup
    if login = conditions.delete(:login)
      where(conditions.to_h).where(['lower(username) = :value OR lower(email) = :value', { :value => login.downcase}]).first
    elsif conditions.has_key?(:username) || conditions.has_key?(:email)
      where(conditions.to_h).first     
    end
  end

  def validate_username
    if User.where(email: username).exists?
      errors.add(:username, :invalid)
    end
  end
         
  def jwt_payload
    super.merge({ username: self.username, role: self.role }) 
  end

  before_validation :strip_whitespace

  def conversations
    User.where(id: received_messages.select(:sender_id))
        .or(User.where(id: sent_messages.select(:receiver_id)))
  end

  def messages_with(other_user)
    Message.where(sender: self, receiver: other_user)
           .or(Message.where(sender: other_user, receiver: self))
  end

  private
  
  def strip_whitespace
    self.url&.strip!
    self.bio&.strip!
  end

  def validate_favorite_channels_count
    errors.add(:favorite_channels, "can't have more than 5 favorites") if favorite_channels.size > 5
  end

  def validate_favorite_users_count
    errors.add(:favorite_users, "can't have more than 5 favorites") if favorite_users.size > 5
  end
end