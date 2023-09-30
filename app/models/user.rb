class User < ApplicationRecord
  include Devise::JWT::RevocationStrategies::JTIMatcher
  include Userable
  
  has_one_attached :avatar
  has_many :subscriptions, dependent: :destroy
  has_many :channels, through: :subscriptions, dependent: :destroy
  has_many :pieces, dependent: :destroy
  has_many :comments, dependent: :destroy
  has_many :votes, dependent: :destroy

  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable,
         :database_authenticatable, :jwt_authenticatable, 
         jwt_revocation_strategy: self
  validates :username, presence: true, 
         uniqueness: { case_sensitive: false }, 
         length: { minimum: 2, maximum: 25 },
         format: { with: /^[a-zA-Z0-9_\.]*$/, multiline: true }

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
    super
  end

end