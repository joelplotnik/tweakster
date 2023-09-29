class UserRegistrationService
    def self.call(user)
        if user.persisted?
            UserMailer.signup_notification(user).deliver_later
        end
    end
end