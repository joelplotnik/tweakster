require 'net/http'
require 'uri'
require 'json'

class Igdb::TokenService
  TOKEN_CACHE_KEY = 'igdb_access_token'

  def self.get_token
    cached = Rails.cache.read(TOKEN_CACHE_KEY)
    return cached if cached.present?

    uri = URI('https://id.twitch.tv/oauth2/token')
    response = Net::HTTP.post_form(uri, {
                                     client_id: Rails.application.credentials.dig(:twitch, :client_id),
                                     client_secret: Rails.application.credentials.dig(:twitch, :client_secret),
                                     grant_type: 'client_credentials'
                                   })

    if response.code == '200'
      data = JSON.parse(response.body)
      token = data['access_token']
      expires_in = data['expires_in']

      Rails.cache.write(TOKEN_CACHE_KEY, token, expires_in: expires_in - 60)
      token
    else
      Rails.logger.error("IGDB token fetch failed: #{response.body}")
      nil
    end
  end
end
