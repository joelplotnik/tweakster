# Preview all emails at http://localhost:3000/rails/mailers/user_mailer
class UserMailerPreview < ActionMailer::Preview

  # Preview this email at http://localhost:3000/rails/mailers/user_mailer/signup_notification
  def signup_notification
    user = User.new(email: 'user@example.com', username: 'TestUser', password: 'Password11!!')
    UserMailer.signup_notification(user)
  end

end
