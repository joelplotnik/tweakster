# Will use this later to schedule job to update game list in db
class IgdbSyncJob < ApplicationJob
  queue_as :default

  def perform
    last_sync_time = Game.maximum(:igdb_updated_at).to_i
    results = Igdb::SyncService.new(last_sync_time).call
    return if results.blank?

    results.each do |game_data|
      igdb_id = game_data['id']
      game = Game.find_or_initialize_by(igdb_id:)

      game.name = game_data['name']
      game.summary = game_data['summary']
      game.igdb_updated_at = Time.at(game_data['updated_at'])
      game.first_release_date = Time.at(game_data['first_release_date']) if game_data['first_release_date']
      game.cover_url = "https:#{game_data.dig('cover', 'url')&.sub(/t_thumb/, 't_cover_big')}"
      game.platforms = game_data['platforms']&.map { |p| p['name'] }
      game.save!
    end
  end
end
