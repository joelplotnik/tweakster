class UserMailer < ApplicationMailer

  # Subject can be set in your I18n file at config/locales/en.yml
  # with the following lookup:
  #
  #   en.user_mailer.signup_notification.subject
  #
  def signup_notification(user)
    @user = user

    mail(to: user.email, subject: 'New User Signup')
  end
end
