class User < ApplicationRecord
  before_validation :strip_whitespace

  has_one_attached :avatar
  has_many :challenges
  has_many :accepted_challenges, dependent: :destroy
  has_many :likes, dependent: :destroy
  has_many :approvals, dependent: :destroy
  has_many :difficulties, dependent: :destroy
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

  serialize :favorite_games, Array

  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable,
         :omniauthable, omniauth_providers: [:twitch]

  validate :validate_username
  validate :validate_favorite_games_count
  validate :password_presence_if_not_oauth, if: :password_required?

  validates :email, format: URI::MailTo::EMAIL_REGEXP
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

  def self.authenticate(email, password)
    user = User.find_for_authentication(email:)
    return user if user && user.provider.present?

    return unless user

    user.valid_password?(password) ? user : nil
  end

  def avatar_url
    Rails.application.routes.url_helpers.url_for(avatar) if avatar.attached?
  end

  def self.find_or_create_from_auth_hash(auth_info)
    user = User.find_by(provider: auth_info.provider, uid: auth_info.uid)

    user ||= User.create(
      provider: auth_info.provider,
      uid: auth_info.uid,
      email: auth_info.info.email,
      username: auth_info.info.nickname,
      encrypted_password: nil
    )
    user
  end

  private

  def validate_username
    return unless User.where(email: username).exists?

    errors.add(:username, :invalid)
  end

  def validate_favorite_games_count
    errors.add(:favorite_games, "can't have more than 5 favorite games") if favorite_games.size > 5
  end

  def strip_whitespace
    url&.strip!
    bio&.strip!
  end

  def password_presence_if_not_oauth
    return unless provider.blank? && encrypted_password.blank?

    errors.add(:encrypted_password, "can't be blank")
  end

  def password_required?
    provider.blank?
  end
end
