class Api::V1::Users::OmniauthCallbacksController < Devise::OmniauthCallbacksController
  skip_before_action :doorkeeper_authorize!, only: %i[twitch failure]

  def twitch
    # Extract OmniAuth auth data directly from the Devise-provided `request.env`
    auth_info = request.env['omniauth.auth'] # Provides twitch tokens as well

    if auth_info
      # Extract client_id from the state parameter
      client_id = params[:state]

      # Find the application based on the client_id
      client_app = Doorkeeper::Application.find_by(uid: client_id)

      unless client_app
        render json: { errors: 'Invalid client application.' }, status: :unprocessable_entity
        return
      end

      # Find or create the user based on the authentication hash
      user = User.find_or_create_from_auth_hash(auth_info)

      if user.persisted?
        # Sign the user in
        sign_in user, event: :authentication

        # Generate the OAuth payload using Doorkeeper and the found client application
        user_token_data = generate_oauth_token(user, client_app)

        # Generate a secure URL-encoded payload
        user_token_json = user_token_data.to_json
        encoded_data = Base64.urlsafe_encode64(user_token_json)

        # Construct the frontend URL with the base64-encoded data
        frontend_url = "http://localhost:5100/auth/callback/twitch##{encoded_data}"

        # Redirect to frontend URL
        redirect_to frontend_url

        # Send the OAuth token and user data back to the frontend in the expected format
        # render json: { frontend_url: }, status: :ok
      else
        # If the user couldn't be saved, respond with an error
        render json: { errors: 'Failed to sign in with Twitch.' }, status: :unprocessable_entity
      end
    else
      # If no auth data found, respond with an error
      render json: { errors: 'No authentication data found.' }, status: :unprocessable_entity
    end
  end

  def failure
    # Return a JSON error response if authentication fails
    render json: { errors: 'Authentication failed, please try again.' }, status: :unauthorized
  end

  private

  def generate_refresh_token
    loop do
      token = SecureRandom.hex(32)
      break token unless Doorkeeper::AccessToken.exists?(refresh_token: token)
    end
  end

  # Generate OAuth token after user authentication
  def generate_oauth_token(user, client_app)
    access_token = Doorkeeper::AccessToken.create(
      resource_owner_id: user.id,
      application_id: client_app.id,
      refresh_token: generate_refresh_token,
      expires_in: Doorkeeper.configuration.access_token_expires_in.to_i,
      scopes: ''
    )

    {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      access_token: access_token.token,
      token_type: 'Bearer',
      expires_in: access_token.expires_in,
      refresh_token: access_token.refresh_token,
      created_at: access_token.created_at.to_time.to_i
    }
  end
end
