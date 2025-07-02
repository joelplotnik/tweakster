require 'net/http'
require 'uri'
require 'json'

class Igdb::SyncService
  IGDB_URL = URI('https://api.igdb.com/v4/games')

  def initialize(last_sync_time)
    @last_sync_time = last_sync_time.to_i
  end

  def call
    token = Igdb::TokenService.get_token
    return unless token

    http = Net::HTTP.new(IGDB_URL.host, IGDB_URL.port)
    http.use_ssl = true

    request = Net::HTTP::Post.new(IGDB_URL)
    request['Client-ID'] = Rails.application.credentials.dig(:twitch, :client_id)
    request['Authorization'] = "Bearer #{token}"
    request['Content-Type'] = 'text/plain'
    request.body = <<~QUERY
      fields id, name, summary, first_release_date, cover.url, platforms.name, updated_at;
      where updated_at > #{@last_sync_time};
      limit 500;
    QUERY

    response = http.request(request)
    return unless response.code == '200'

    JSON.parse(response.body)
  rescue StandardError => e
    Rails.logger.error("IGDB sync failed: #{e.message}")
    nil
  end
end
