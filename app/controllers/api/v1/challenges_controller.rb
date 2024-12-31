class Api::V1::ChallengesController < ApplicationController
  skip_before_action :verify_authenticity_token, raise: false
  before_action :authenticate_devise_api_token!, only: %i[create update destroy]
  before_action :authenticate_devise_api_token_if_present!, only: %i[show]
  before_action :set_user, only: [:index]
  before_action :set_game, only: [:index]
  before_action :set_challenge, only: %i[show update destroy]

  def index
    if @user
      challenges = @user.challenges.includes(:user, :game)
    elsif @game
      challenges = @game.challenges.includes(:user, :game)
    else
      render json: { error: 'User or game must be specified' }, status: :unprocessable_entity and return
    end

    paginated_challenges = challenges.paginate(page: params[:page], per_page: 10)

    challenges_with_metadata = paginated_challenges.map do |challenge|
      format_challenge(challenge)
    end

    render json: challenges_with_metadata
  end

  def show
    is_owner = current_user.present? && current_user == @challenge.user

    render json: format_challenge(@challenge).merge({
                                                      is_owner:
                                                    })
  end

  def create
    challenge = Challenge.new(challenge_params.merge(user_id: params[:user_id], game_id: params[:game_id]))

    if challenge.save
      render json: { message: 'Challenge created successfully', challenge: format_challenge(challenge) },
             status: :created
    else
      render json: { errors: challenge.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    @challenge = find_challenge

    if @challenge.update(challenge_params)
      render json: { message: 'Challenge updated successfully', challenge: format_challenge(@challenge) }
    else
      render json: { errors: @challenge.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @challenge = find_challenge

    if @challenge
      @challenge.destroy
      render json: { message: 'Challenge deleted successfully' }, status: :no_content
    else
      render json: { error: 'Challenge not found' }, status: :not_found
    end
  end

  def popular_challenges
    limit = params[:limit] || 5
    page = params[:page] || 1
    point_in_time = params[:point_in_time] || Time.current

    popular_challenges = Challenge
                         .left_joins(:attempts)
                         .where('attempts.created_at >= ? AND attempts.created_at <= ?', 7.days.ago, point_in_time)
                         .group('challenges.id')
                         .order('COUNT(attempts.id) DESC')
                         .paginate(page:, per_page: limit)
                         .map { |challenge| format_challenge(challenge) }

    render json: { challenges: popular_challenges, point_in_time: }, status: :ok
  end

  private

  def challenge_params
    params.require(:challenge).permit(:title, :description, :category)
  end

  def set_user
    @user = User.friendly.find(params[:user_id]) if params[:user_id]
  end

  def set_game
    @game = Game.friendly.find(params[:game_id]) if params[:game_id]
  end

  def set_challenge
    @challenge = Challenge.find(params[:id]) if params[:id]
  end

  def format_challenge(challenge)
    challenge.as_json(include: {
                        game: {},
                        user: {}
                      },
                      methods: %i[comments_count attempts_count difficulty_rating])
  end
end
