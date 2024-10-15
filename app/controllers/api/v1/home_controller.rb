# require 'will_paginate/array'

class Api::V1::HomeController < ApplicationController
  def index
    games = Game.order(created_at: :desc).limit(6)

    render json: games, include: %i[challenges accepted_challenges]
  end
end
