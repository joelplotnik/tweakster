class Api::V1::ChallengesController < ApplicationController
  skip_before_action :verify_authenticity_token, raise: false
  before_action :authenticate_devise_api_token!, only: %i[create update destroy]
  before_action :authenticate_devise_api_token_if_present!, only: %i[index show]
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

    user_votes = if current_user
                   Vote.where(user: current_user, challenge_id: paginated_challenges.pluck(:id)).pluck(
                     :challenge_id, :vote_type
                   ).to_h
                 else
                   {}
                 end

    user_ratings = if current_user
                     Difficulty.where(user: current_user, challenge_id: paginated_challenges.pluck(:id))
                               .pluck(:challenge_id, :rating).to_h
                   else
                     {}
                   end

    user_attempts = if current_user
                      Attempt.where(user: current_user, challenge_id: paginated_challenges.pluck(:id))
                             .pluck(:challenge_id, :id).to_h
                    else
                      {}
                    end

    challenges_with_metadata = paginated_challenges.map do |challenge|
      formatted_challenge = format_challenge(challenge)
      formatted_challenge.merge(
        'user_vote' => user_votes[challenge.id],
        'user_rating' => user_ratings[challenge.id],
        'user_attempted' => user_attempts.key?(challenge.id),
        'user_attempt_id' => user_attempts[challenge.id],
        'is_owner' => current_user.present? && (current_user == challenge.user)
      )
    end

    render json: challenges_with_metadata
  end

  def show
    is_owner = current_user.present? && current_user == @challenge.user
    user_vote = current_user ? Vote.find_by(user: current_user, challenge: @challenge)&.vote_type : nil
    user_rating = current_user ? Difficulty.find_by(user: current_user, challenge: @challenge)&.rating : nil
    user_attempt = current_user ? Attempt.find_by(user: current_user, challenge: @challenge) : nil

    render json: format_challenge(@challenge).merge({
                                                      is_owner:,
                                                      user_vote:,
                                                      user_rating:,
                                                      user_attempted: user_attempt.present?,
                                                      user_attempt_id: user_attempt&.id
                                                    })
  end

  def create
    challenge = Challenge.new(challenge_params.except(:image))
    challenge.user = current_user

    challenge.image.attach(params[:challenge][:image]) if params[:challenge][:image].present?

    if challenge.save
      render json: { message: 'Challenge created successfully', challenge: format_challenge(challenge) },
             status: :created
    else
      render json: { errors: challenge.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # def update
  #   @challenge = find_challenge

  #   if @challenge.update(challenge_params)
  #     render json: { message: 'Challenge updated successfully', challenge: format_challenge(@challenge) }
  #   else
  #     render json: { errors: @challenge.errors.full_messages }, status: :unprocessable_entity
  #   end
  # end

  def destroy
    render json: { error: 'Challenge not found' }, status: :not_found and return unless @challenge

    unless current_user == @challenge.user
      render json: { error: 'Unauthorized to delete this challenge' }, status: :unauthorized and return
    end

    if @challenge.destroy
      render json: { message: 'Challenge deleted successfully' }, status: :ok
    else
      render json: { error: 'Failed to delete challenge' }, status: :unprocessable_entity
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
    params.require(:challenge).permit(:game_id, :title, :description, :category, :image)
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
                        user: {
                          methods: [:avatar_url]
                        }
                      },
                      methods: %i[comments_count active_attempts_count difficulties_count difficulty_rating image_url])
  end
end
