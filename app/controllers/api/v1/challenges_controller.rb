class Api::V1::ChallengesController < ApplicationController
  before_action :doorkeeper_authorize!, except: %i[index show popular_challenges]
  before_action :set_game, only: %i[index show]
  before_action :set_challenge, only: %i[show update destroy]

  def index
    challenges = @game.challenges.includes(:difficulties, :likes)
    render json: challenges.map { |challenge| format_challenge(challenge) }, status: :ok
  end

  def popular_challenges
    limit = params[:limit] || 5
    page = params[:page] || 1
    point_in_time = params[:point_in_time] || Time.current

    popular_challenges = Challenge
                         .left_joins(:likes)
                         .where('likes.created_at >= ? AND likes.created_at <= ?', 7.days.ago, point_in_time)
                         .group('challenges.id')
                         .order('COUNT(likes.id) DESC')
                         .paginate(page:, per_page: limit)
                         .map { |challenge| format_challenge(challenge) }

    render json: { challenges: popular_challenges, point_in_time: }, status: :ok
  end

  def show
    if @challenge
      render json: format_challenge(@challenge)
    else
      render json: { error: 'Challenge not found for this game' }, status: :not_found
    end
  end

  def create
    challenge = @game.challenges.new(challenge_params)
    if challenge.save
      render json: { message: 'Challenge created successfully', challenge: format_challenge(challenge) },
             status: :created
    else
      render json: { errors: challenge.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @challenge.update(challenge_params)
      render json: { message: 'Challenge updated successfully', challenge: format_challenge(@challenge) }
    else
      render json: { errors: @challenge.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @challenge.destroy
    render json: { message: 'Challenge deleted successfully' }, status: :no_content
  end

  private

  def challenge_params
    params.require(:challenge).permit(:title, :description)
  end

  def set_game
    @game = Game.find(params[:game_id])
  end

  def set_challenge
    @challenge = @game.challenges.find_by(id: params[:id])
    render json: { error: 'Challenge not found for this game' }, status: :not_found unless @challenge
  end

  def format_challenge(challenge)
    challenge.as_json(include: {
                        game: {}
                      })
  end
end
