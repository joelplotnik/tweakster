class Api::V1::Users::OmniauthCallbacksController < Devise::OmniauthCallbacksController
  def twitch
    auth_info = request.env['omniauth.auth']

    if auth_info
      user = User.find_or_create_from_auth_hash(auth_info)

      if user.persisted?
        access_token = Devise::Api::Token.generate_uniq_access_token(user)
        refresh_token = Devise::Api::Token.generate_uniq_refresh_token(user)
        expires_in = Devise.api.config.access_token.expires_in

        token = Devise::Api::Token.create!(
          resource_owner: user,
          access_token:,
          refresh_token:,
          expires_in:
        )

        response_data = {
          token: token.access_token,
          refresh_token: token.refresh_token,
          expires_in: token.expires_in,
          token_type: 'Bearer',
          resource_owner: {
            id: user.id,
            email: user.email,
            username: user.username,
            avatar_url: user.avatar_url,
            role: user.role,
            created_at: user.created_at.iso8601,
            updated_at: user.updated_at.iso8601
          }
        }

        encoded_data = Base64.urlsafe_encode64(response_data.to_json)

        frontend_callback_url = "#{Rails.configuration.base_url}/auth/callback/twitch"

        redirect_to "#{frontend_callback_url}?data=#{encoded_data}"
      else
        render json: { errors: 'Failed to sign in with Twitch.' }, status: :unprocessable_entity
      end
    else
      render json: { errors: 'No authentication data found.' }, status: :unprocessable_entity
    end
  end
end
