class Api::V1::GamesController < ApplicationController
  skip_before_action :verify_authenticity_token, raise: false
  before_action :authenticate_devise_api_token!, only: %i[create update destroy]
  before_action :set_game, only: %i[show update destroy]

  def index
    limit = params[:limit] || 5
    page = params[:page] || 1

    games = Game
            .with_attached_image
            .paginate(page:, per_page: limit)
            .order(name: :asc)
            .map { |game| format_game(game) }

    render json: games
  end

  def popular_games
    limit = params[:limit] || 5
    page = params[:page] || 1
    point_in_time = params[:point_in_time] || Time.current

    popular_games = Game
                    .with_attached_image
                    .left_joins(challenges: :attempts)
                    .where('attempts.created_at >= ? AND attempts.created_at <= ?', 7.days.ago, point_in_time)
                    .group('games.id')
                    .order('COUNT(attempts.id) DESC')
                    .paginate(page:, per_page: limit)
                    .map { |game| format_game(game) }

    render json: { games: popular_games, point_in_time: }, status: :ok
  end

  def show
    render json: format_game(@game)
  end

  def create
    game = Game.new(game_params)
    if game.save
      render json: { message: 'Game created successfully', game: format_game(game) }, status: :created
    else
      render json: { errors: game.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @game.update(game_params)
      render json: { message: 'Game updated successfully', game: format_game(@game) }
    else
      render json: { errors: @game.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @game.destroy
    render json: { message: 'Game deleted successfully' }, status: :no_content
  end

  def search
    search_term = params[:search_term].downcase.strip
    games = Game.where('LOWER(name) LIKE ?', "#{search_term}%")
                .paginate(page: params[:page], per_page: 5)
                .order(created_at: :asc)
                .map { |game| format_game(game) }

    render json: games
  end

  private

  def game_params
    params.require(:game).permit(:name, :image, :description)
  end

  def set_game
    @game = Game.friendly.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Game not found' }, status: :not_found
  end

  def format_game(game)
    game.as_json.merge({
                         image_url: game.image_url
                       })
  end
end
