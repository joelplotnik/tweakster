class Api::V1::ChallengesController < ApplicationController
  load_and_authorize_resource
  before_action :authenticate_user!, except: %i[index show]
  before_action :set_game
  before_action :set_challenge, only: %i[show update destroy]

  rescue_from CanCan::AccessDenied do |exception|
    render json: { warning: exception }, status: :unauthorized
  end

  def index
    challenges = @game.challenges.includes(:difficulties, :likes)
    render json: challenges.map { |challenge| format_challenge(challenge) }, status: :ok
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
    {
      id: challenge.id,
      title: challenge.title,
      description: challenge.description,
      likes: challenge.likes.count,
      difficulty: challenge.average_difficulty,
      created_at: challenge.created_at,
      updated_at: challenge.updated_at
    }
  end
end
