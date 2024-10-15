class User < ApplicationRecord
  include Devise::JWT::RevocationStrategies::JTIMatcher

  before_validation :strip_whitespace

  has_one_attached :avatar
  has_many :challenges
  has_many :accepted_challenges, dependent: :destroy
  has_many :likes, dependent: :destroy
  has_many :approvals, dependent: :destroy
  has_many :difficulty_ratings, dependent: :destroy
  has_many :comments, dependent: :destroy
  has_many :reports, foreign_key: 'reporter_id'
  has_many :notifications, as: :recipient, dependent: :destroy, class_name: 'Noticed::Notification'
  has_many :notification_mentions, as: :record, dependent: :destroy, class_name: 'Noticed::Event'

  # Users you follow
  has_many :followed_users, foreign_key: :follower_id,
                            class_name: 'Relationship', dependent: :destroy
  has_many :followees, through: :followed_users, dependent: :destroy
  # Users following you
  has_many :following_users, foreign_key: :followee_id,
                             class_name: 'Relationship', dependent: :destroy
  has_many :followers, through: :following_users, dependent: :destroy

  serialize :favorite_users, Array

  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable,
         :database_authenticatable, :jwt_authenticatable,
         jwt_revocation_strategy: self

  validate :validate_username
  # validate :validate_favorite_games_count

  validates :username, presence: true,
                       uniqueness: { case_sensitive: false },
                       length: { minimum: 2, maximum: 25 },
                       format: { with: /^[a-zA-Z0-9_.]*$/, multiline: true }
  validates :url, allow_blank: true, length: { minimum: 7, maximum: 74 }
  validates :bio, allow_blank: true, length: { minimum: 2, maximum: 280 }

  ROLES = %w[admin moderator advertiser user].freeze

  # Create methods at runtime for users (meta programming)
  ROLES.each do |role_name|
    define_method "#{role_name}?" do
      role == role_name
    end
  end

  attr_writer :login

  def login
    login || username || email
  end

  def self.find_for_database_authentication(warden_conditions)
    conditions = warden_conditions.dup
    login = conditions.delete(:login)

    if login
      where(conditions.to_h).where(['lower(username) = :value OR lower(email) = :value',
                                    { value: login.downcase }]).first
    elsif conditions.key?(:username) || conditions.key?(:email)
      where(conditions.to_h).first
    end
  end

  def jwt_payload
    super.merge({ username:, role: })
  end

  def avatar_url
    Rails.application.routes.url_helpers.url_for(avatar) if avatar.attached?
  end

  private

  def validate_username
    return unless User.where(email: username).exists?

    errors.add(:username, :invalid)
  end

  # def validate_favorite_games_count
  #   errors.add(:favorite_games, "can't have more than 5 favorite games") if favorite_games.size > 5
  # end

  def strip_whitespace
    url&.strip!
    bio&.strip!
  end
end
