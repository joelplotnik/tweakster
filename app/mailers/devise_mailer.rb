class DeviseMailer < Devise::Mailer
  def reset_password_instructions(record, token, opts = {})
    # Use the appropriate base URL for the environment
    base_url = Rails.env.production? ? 'https://tweakster.com' : 'http://localhost:5100'

    # Customize the URL to match your front-end route
    @reset_password_url = "#{base_url}/account-recovery/reset-password/#{token}"

    # Call the parent class to complete the setup
    super
  end
end
