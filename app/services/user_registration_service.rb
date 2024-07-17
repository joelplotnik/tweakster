class UserRegistrationService
  def self.call(user)
    return unless user.persisted?

    UserMailer.signup_notification(user).deliver_later
  end
end
