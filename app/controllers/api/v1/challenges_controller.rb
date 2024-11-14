require 'will_paginate/array'

class Api::V1::ChallengesController < ApplicationController
  before_action :doorkeeper_authorize!, except: %i[index show popular_challenges]
  before_action :set_challenge, only: %i[show update destroy]

  def index
    challenges = Challenge.all

    challenges = challenges.where(user_id: params[:user_id]) if params[:user_id]
    challenges = challenges.where(game_id: params[:game_id]) if params[:game_id]

    challenges = challenges.paginate(page: params[:page], per_page: params[:per_page] || 10)

    render json: challenges.map { |challenge| format_challenge(challenge) }, status: :ok
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

  def show
    @challenge = find_challenge

    if @challenge
      render json: format_challenge(@challenge)
    else
      render json: { error: 'Challenge not found' }, status: :not_found
    end
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

  private

  def challenge_params
    params.require(:challenge).permit(:title, :description, :category)
  end

  def set_challenge
    @challenge = find_challenge
    render json: { error: 'Challenge not found' }, status: :not_found unless @challenge
  end

  def find_challenge
    if params[:user_id]
      Challenge.find_by(id: params[:id], user_id: params[:user_id])
    elsif params[:game_id]
      Challenge.find_by(id: params[:id], game_id: params[:game_id])
    else
      Challenge.find_by(id: params[:id])
    end
  end

  def format_challenge(challenge)
    challenge.as_json(include: {
                        game: {},
                        user: {}
                      })
  end
end
