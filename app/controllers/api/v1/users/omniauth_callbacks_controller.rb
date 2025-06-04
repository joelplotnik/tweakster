class Api::V1::Users::OmniauthCallbacksController < Devise::OmniauthCallbacksController
  def after_omniauth_failure_path_for(_scope)
    Rails.configuration.base_url
  end

  def google_oauth2
    auth_info = request.env['omniauth.auth']
    frontend_callback_url = "#{Rails.configuration.base_url}/auth/callback/google_oauth2"

    if auth_info
      youtube_profile = fetch_youtube_profile(auth_info['credentials']['token'])

      user = User.find_or_create_from_auth_hash_google_oauth2(auth_info, youtube_profile)

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

        redirect_to "#{frontend_callback_url}?data=#{encoded_data}"
      else
        error_message = 'Failed to sign in with Google.'
        status_code = 422
        redirect_to "#{frontend_callback_url}?error=#{CGI.escape(error_message)}&status=#{status_code}"
      end
    else
      error_message = 'No authentication data found.'
      status_code = 422
      redirect_to "#{frontend_callback_url}?error=#{CGI.escape(error_message)}&status=#{status_code}"
    end
  end

  def twitch
    auth_info = request.env['omniauth.auth']
    frontend_callback_url = "#{Rails.configuration.base_url}/auth/callback/twitch"

    if auth_info
      user = User.find_or_create_from_auth_hash_twitch(auth_info)

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

        redirect_to "#{frontend_callback_url}?data=#{encoded_data}"
      else
        error_message = 'Failed to sign in with Twitch.'
        status_code = 422
        redirect_to "#{frontend_callback_url}?error=#{CGI.escape(error_message)}&status=#{status_code}"
      end
    else
      error_message = 'No authentication data found.'
      status_code = 422
      redirect_to "#{frontend_callback_url}?error=#{CGI.escape(error_message)}&status=#{status_code}"
    end
  end

  private

  def fetch_youtube_profile(access_token)
    url = URI('https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true')
    http = Net::HTTP.new(url.host, url.port)
    http.use_ssl = true
    request = Net::HTTP::Get.new(url)
    request['Authorization'] = "Bearer #{access_token}"

    response = http.request(request)
    data = JSON.parse(response.body)

    # Handle errors if no channels
    return nil unless data['items']&.any?

    channel = data['items'].first

    # Get handle (@customUrl or title) and remove leading @ if present
    handle_value = channel.dig('snippet', 'customUrl') || channel.dig('snippet', 'title')
    handle = handle_value&.sub(/^@/, '')

    # Get avatar URL (medium size preferred)
    avatar_url = channel.dig('snippet', 'thumbnails', 'medium',
                             'url') || channel.dig('snippet', 'thumbnails', 'default', 'url')

    # Return both as a hash
    {
      handle:,
      avatar: avatar_url
    }
  end
end
