require 'open-uri'
require 'mini_magick'

class User < ApplicationRecord
  extend FriendlyId
  friendly_id :username, use: :slugged

  before_validation :strip_whitespace

  has_one_attached :avatar
  has_one :user_game, dependent: :destroy
  has_one :game, through: :user_game
  has_many :identities, dependent: :destroy
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
         :omniauthable, omniauth_providers: %i[google_oauth2 twitch]

  validate :validate_username

  validates :email, format: URI::MailTo::EMAIL_REGEXP
  validates :username, presence: true,
                       uniqueness: { case_sensitive: false },
                       length: { minimum: 4, maximum: 25 },
                       format: { with: /\A[a-zA-Z0-9_]*\z/, multiline: true }
  validates :bio, length: { in: 2..255 }, allow_blank: true

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

  def self.find_or_create_from_auth_hash_google_oauth2(auth_info, youtube_profile)
    identity = Identity.find_or_initialize_by(provider: auth_info.provider, uid: auth_info.uid)
    user = identity.user

    user = User.find_by(email: auth_info.info.email) if user.nil? && auth_info.info.email.present?

    unless user
      username = generate_unique_username(youtube_profile[:handle] || auth_info.info.name)

      user = User.new(
        email: auth_info.info.email,
        username:,
        password: SecureRandom.hex(16)
      )

      if user.save
        avatar_url = youtube_profile[:avatar] || auth_info.info.image

        if avatar_url.present?
          begin
            io = URI.parse(avatar_url).open
            user.avatar.attach(io:, filename: "avatar_#{SecureRandom.hex(10)}.jpg", content_type: io.content_type)
          rescue StandardError => e
            Rails.logger.error("Failed to attach Google avatar: #{e.message}")
            user.set_default_avatar
          end
        else
          user.set_default_avatar
        end
      else
        Rails.logger.error("Failed to create user: #{user.errors.full_messages.join(', ')}")
        return nil
      end
    end

    identity.user ||= user

    attributes = {
      access_token: auth_info.credentials.token,
      refresh_token: auth_info.credentials.refresh_token
    }
    attributes[:token_expires_at] = Time.at(auth_info.credentials.expires_at) if auth_info.credentials.expires_at

    unless identity.update(attributes)
      Rails.logger.error("Failed to update identity: #{identity.errors.full_messages.join(', ')}")
      return nil
    end

    user
  end

  def self.find_or_create_from_auth_hash_twitch(auth_info)
    identity = Identity.find_or_initialize_by(provider: auth_info.provider, uid: auth_info.uid)
    user = identity.user

    user = User.find_by(email: auth_info.info.email) if user.nil? && auth_info.info.email.present?

    unless user
      username = generate_unique_username(auth_info.info.nickname)

      user = User.new(
        email: auth_info.info.email,
        username:,
        password: SecureRandom.hex(16)
      )

      if user.save
        avatar_url = auth_info.info.image
        if avatar_url.present? && !avatar_url.include?('user-default-pictures-uv')
          begin
            io = URI.parse(avatar_url).open
            user.avatar.attach(io:, filename: "avatar_#{SecureRandom.hex(10)}.jpg", content_type: io.content_type)
          rescue StandardError => e
            Rails.logger.error("Failed to attach Twitch avatar: #{e.message}")
            user.set_default_avatar
          end
        else
          user.set_default_avatar
        end
      else
        Rails.logger.error("Failed to create Twitch user: #{user.errors.full_messages.join(', ')}")
        return nil
      end
    end

    identity.user ||= user

    attributes = {
      access_token: auth_info.credentials.token
    }
    attributes[:refresh_token] = auth_info.credentials.refresh_token if auth_info.credentials.refresh_token
    attributes[:token_expires_at] = Time.at(auth_info.credentials.expires_at) if auth_info.credentials.expires_at

    unless identity.update(attributes)
      Rails.logger.error("Failed to update Twitch identity: #{identity.errors.full_messages.join(', ')}")
      return nil
    end

    user
  end

  def self.generate_unique_username(base)
    username = base.parameterize
    suffix = 1

    while User.exists?(username:)
      suffix += 1
      username = "#{base.parameterize}-#{suffix}"
    end

    username
  end

  def currently_playing_game
    user_game = self.user_game
    return nil unless user_game

    user_game.game.slice(:id, :name, :slug)
  end

  def challenges_count
    challenges.size
  end

  def attempts_count
    attempts.size
  end

  def active_attempts_count
    attempts.where.not(status: 'Pending').size
  end

  def points
    attempts.joins(:approvals).count
  end

  def following?(other_user)
    followees.exists?(id: other_user.id)
  end

  def followers_count
    followers.size
  end

  def followees_count
    followees.size
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
    bio&.strip!
  end
end
