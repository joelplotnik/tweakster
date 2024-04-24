class UserMailer < ApplicationMailer
  def signup_notification(user)
    @user = user

    mail(to: user.email, subject: 'New User Signup')
  end
end
