require 'net/http'
require 'uri'
require 'json'

class Igdb::SearchService
  IGDB_SEARCH_URL = URI('https://api.igdb.com/v4/games')

  def initialize(query)
    @query = query
  end

  def call
    token = Igdb::TokenService.get_token
    return nil unless token

    http = Net::HTTP.new(IGDB_SEARCH_URL.host, IGDB_SEARCH_URL.port)
    http.use_ssl = true

    request = Net::HTTP::Post.new(IGDB_SEARCH_URL)
    request['Client-ID'] = Rails.application.credentials.dig(:twitch, :client_id)
    request['Authorization'] = "Bearer #{token}"
    request['Content-Type'] = 'text/plain'
    request.body = <<~QUERY
      search "#{@query}";
      fields name,cover.url,first_release_date,summary,platforms.name;
      limit 10;
    QUERY

    response = http.request(request)
    return nil unless response.code == '200'

    results = JSON.parse(response.body)

    # Replace cover image size
    results.each do |game|
      if game['cover'] && game['cover']['url']
        game['cover']['url'] = "https:#{game['cover']['url'].sub(/t_thumb/, 't_cover_big')}"
      end
    end

    results
  rescue StandardError => e
    Rails.logger.error("IGDB search failed: #{e.message}")
    nil
  end
end
