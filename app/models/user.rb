class User < ApplicationRecord
  include Devise::JWT::RevocationStrategies::JTIMatcher
  include Userable

  before_save :calculate_integrity
  
  has_one_attached :avatar
  has_many :subscriptions, dependent: :destroy
  has_many :channels, through: :subscriptions, dependent: :destroy
  has_many :pieces, dependent: :destroy
  has_many :comments, dependent: :destroy
  has_many :votes, dependent: :destroy

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

  private
  
  def strip_whitespace
    self.url&.strip!
    self.bio&.strip!
  end
end