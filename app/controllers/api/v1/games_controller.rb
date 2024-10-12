class Api::V1::GamesController < ApplicationController
  def index
    limit = params[:limit] || 5
    page = params[:page] || 1

    games = Game
            .paginate(page:, per_page: limit)
            .order(created_at: :asc)
            .map do |game|
      {
        id: game.id,
        name: game.name,
        image_url: game.image_url,
        platform: game.platform
      }
    end

    render json: games
  end

  def show
    game = Game.find(params[:id])
    render json: {
      id: game.id,
      name: game.name,
      platform: game.platform,
      image_url: game.image_url,
      description: game.description,
      created_at: game.created_at,
      updated_at: game.updated_at
    }
  end

  def create
    game = Game.new(game_params)
    if game.save
      render json: { message: 'Game created successfully', game: }, status: :created
    else
      render json: { errors: game.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    game = Game.find(params[:id])
    if game.update(game_params)
      render json: { message: 'Game updated successfully', game: }
    else
      render json: { errors: game.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    game = Game.find(params[:id])
    game.destroy
    render json: { message: 'Game deleted successfully' }, status: :no_content
  end

  def search
    search_term = params[:search_term].downcase.strip
    games = Game.where('LOWER(name) LIKE ?', "#{search_term}%")

    games = games
            .paginate(page: params[:page], per_page: 5)
            .order(created_at: :asc)
            .map do |game|
      {
        id: game.id,
        name: game.name,
        image_url: game.image_url,
        platform: game.platform
      }
    end

    render json: games
  end

  private

  def game_params
    params.require(:game).permit(:name, :image, :description)
  end
end
