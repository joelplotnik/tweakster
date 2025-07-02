# app/services/igdb/game_importer_service.rb
class Igdb::GameImporterService
  def initialize(batch_size: 500, last_sync_time: 0)
    @batch_size = batch_size
    @last_sync_time = last_sync_time
  end

  def import_all
    loop do
      puts "Fetching games updated after timestamp: #{@last_sync_time}"

      results = fetch_games
      break if results.blank?

      import_games(results)

      @last_sync_time = results.map { |g| g['updated_at'] }.max
      puts "Imported #{results.size} games. Next last_sync_time: #{@last_sync_time}"

      break if results.size < @batch_size
    end

    puts 'Bulk import completed.'
  end

  def import_one_batch
    results = fetch_games
    if results.blank?
      puts 'No games found.'
      return
    end

    import_games(results)
    puts "Imported #{results.size} games."
  end

  private

  def fetch_games
    Igdb::SyncService.new(@last_sync_time).call
  end

  def import_games(results)
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
