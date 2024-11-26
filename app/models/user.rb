require 'open-uri'
require 'mini_magick'

class User < ApplicationRecord
  extend FriendlyId
  friendly_id :username, use: :slugged

  before_validation :strip_whitespace

  has_one_attached :avatar
  has_many :challenges
  has_many :attempts, dependent: :destroy
  has_many :likes, dependent: :destroy
  has_many :votes, dependent: :destroy
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

  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable, :api,
         :omniauthable, omniauth_providers: [:twitch]

  validate :validate_username
  validate :unique_uid_for_provider, if: -> { provider.present? && uid.present? && new_record? }

  validates :email, format: URI::MailTo::EMAIL_REGEXP
  validates :username, presence: true,
                       uniqueness: { case_sensitive: false },
                       length: { minimum: 4, maximum: 25 },
                       format: { with: /\A[a-zA-Z0-9_]*\z/, multiline: true }
  validates :url, allow_blank: true, length: { minimum: 7, maximum: 74 }
  validates :bio, allow_blank: true, length: { minimum: 2, maximum: 280 }

  after_create :set_default_avatar, if: -> { !avatar.attached? }
  before_destroy :retain_default_avatar_if_needed

  ROLES = %w[admin moderator advertiser user].freeze

  # Create methods at runtime for users (meta programming)
  ROLES.each do |role_name|
    define_method "#{role_name}?" do
      role == role_name
    end
  end

  def self.authenticate(email, password)
    user = User.find_for_authentication(email:)
    return unless user

    user.valid_password?(password) ? user : nil
  end

  def avatar_url
    Rails.application.routes.url_helpers.url_for(avatar) if avatar.attached?
  end

  def reset_avatar_to_default
    avatar.purge if avatar.attached?

    set_default_avatar
  end

  def set_default_avatar
    return if avatar.attached?

    default_avatar_path = Rails.root.join('app', 'assets', 'images', 'default_avatar.png')

    if File.exist?(default_avatar_path)
      avatar.attach(
        io: File.open(default_avatar_path),
        filename: 'default_avatar.png',
        content_type: 'image/png'
      )

      save(validate: false)
    else
      Rails.logger.warn("Default avatar file not found at #{default_avatar_path}")
    end
  end

  def self.find_or_create_from_auth_hash(auth_info)
    user = User.find_by(provider: auth_info.provider, uid: auth_info.uid)

    unless user
      user = User.new(
        email: auth_info.info.email,
        username: auth_info.info.nickname,
        provider: auth_info.provider,
        uid: auth_info.uid,
        password: SecureRandom.hex(16)
      )

      if auth_info.info.image.present? && !auth_info.info.image.include?('user-default-pictures-uv')
        image_url = auth_info.info.image
        io = URI.parse(image_url).open
        user.avatar.attach(io:, filename: "avatar_#{SecureRandom.hex(10)}.jpg", content_type: io.content_type)
      else
        user.set_default_avatar
      end

      user.save!
    end

    user
  end

  private

  def validate_username
    return unless User.where(email: username).exists?

    errors.add(:username, :invalid)
  end

  def retain_default_avatar_if_needed
    return unless avatar.attached? && avatar.filename.to_s == 'default_avatar.png'

    avatar.detach
  end

  def strip_whitespace
    url&.strip!
    bio&.strip!
  end

  def unique_uid_for_provider
    return unless provider.present? && uid.present? && User.exists?(provider:, uid:)

    errors.add(:uid, 'has already been taken for this provider')
  end
end
