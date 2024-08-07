require 'will_paginate/array'

class Api::V1::TweaksController < ApplicationController
  include Tweakable

  before_action :authenticate_user!, except: %i[index show]
  before_action :set_piece, only: %i[index create]
  before_action :set_tweak, only: %i[show update destroy]

  def index
    piece = set_piece

    tweaks = piece.tweaks.includes(:user, :votes)

    tweaks = if params[:sort] == 'new'
               tweaks.order(created_at: :desc)
             else
               tweaks.sort_by { |tweak| calculate_tweak_score(tweak) }.reverse
             end

    page = params[:page] || 1
    per_page = 10
    paginated_tweaks = tweaks.paginate(page:, per_page:)

    more_tweaks = paginated_tweaks.next_page.present?

    tweaks_with_additional_info = paginated_tweaks.map do |tweak|
      tweak_data = tweak.as_json(include: {
                                   user: {
                                     only: %i[id username],
                                     methods: [:avatar_url]
                                   },
                                   votes: { only: %i[user_id vote_type] }
                                 }).merge({
                                            channel_id: piece.channel.id,
                                            comments_count: tweak.comments.size
                                          })

      tweak_data
    end

    render json: {
      tweaks: tweaks_with_additional_info,
      meta: {
        has_more: more_tweaks
      }
    }
  end

  def show
    tweak = set_tweak
    render json: tweak
  end

  def create
    piece = set_piece
    tweak = piece.tweaks.new(tweak_params)
    tweak.user = current_user

    if tweak.save
      render json: tweak, status: :created
    else
      render json: { error: tweak.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    tweak = set_tweak
    if tweak.update(tweak_params)
      render json: tweak
    else
      render json: { error: tweak.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    tweak = set_tweak
    if tweak.destroy
      render json: { message: 'Tweak successfully deleted' }, status: :ok
    else
      render json: { error: 'Failed to delete tweak' }, status: :unprocessable_entity
    end
  end

  private

  def set_piece
    piece = Piece.find(params[:piece_id])
    return piece if piece.channel.id == params[:channel_id].to_i

    render json: { error: 'Piece does not belong to the specified channel' }, status: :not_found
    nil
  end

  def set_tweak
    Tweak.find(params[:id])
  end

  def tweak_params
    params.require(:tweak).permit(:content)
  end
end
