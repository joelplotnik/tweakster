require 'will_paginate/array'

class Api::V1::HomeController < ApplicationController
  include Userable
  include Pieceable

  def index
    sorted_pieces = if params[:sort] == 'new'
                      Piece.order(created_at: :desc)
                    else
                      Piece.all.sort_by { |piece| calculate_piece_score(piece) }.reverse
                    end

    paginated_pieces = sorted_pieces.paginate(page: params[:page], per_page: 10)

    pieces_with_images = paginated_pieces.map do |piece|
      image_urls = piece.images.map { |image| url_for(image) }

      piece_data = piece.as_json(include: {
                                   user: {
                                     only: %i[id username],
                                     methods: [:avatar_url]
                                   },
                                   channel: { only: %i[id name] },
                                   votes: { only: %i[user_id vote_type] }
                                 }).merge({
                                            images: image_urls,
                                            comments_count: piece.comments.size
                                          })

      piece_data
    end

    render json: pieces_with_images
  end

  def personal_feed
    user = current_user

    subscribed_channels = user.subscriptions.map(&:channel)

    channel_pieces = Piece.where(channel: subscribed_channels)
    followee_pieces = Piece.where(user_id: user.followees.pluck(:id))

    all_personal_pieces = (channel_pieces + followee_pieces).uniq

    sorted_personal_pieces = if params[:sort] == 'new'
                               all_personal_pieces.order(created_at: :desc)
                             else
                               all_personal_pieces.sort_by { |piece| calculate_piece_score(piece) }.reverse
                             end

    paginated_personal_pieces = sorted_personal_pieces.paginate(page: params[:page], per_page: 10)

    pieces_with_images = paginated_personal_pieces.map do |piece|
      image_urls = piece.images.map { |image| url_for(image) }

      piece_data = piece.as_json(include: {
                                   user: {
                                     only: %i[id username],
                                     methods: [:avatar_url]
                                   },
                                   channel: { only: %i[id name] },
                                   votes: { only: %i[user_id vote_type] }
                                 }).merge({
                                            images: image_urls,
                                            comments_count: piece.comments.size
                                          })

      piece_data
    end

    render json: pieces_with_images
  end

  def mischief_makers
    pieces_with_images = []
    added_piece_ids = Set.new

    current_day = Date.current
    days_to_look_back = 0

    while pieces_with_images.length < 4 && days_to_look_back < 30
      target_day = current_day - days_to_look_back.days

      pieces = Piece
               .left_joins(:votes)
               .where(votes: { votable_type: 'Piece' })
               .where('votes.created_at >= ? AND votes.created_at < ?', target_day.beginning_of_day, (target_day + 1.day).beginning_of_day)
               .group('pieces.id')
               .having('COUNT(votes.vote_type) > 0')
               .order('COUNT(votes.vote_type) DESC')
               .limit(4 - pieces_with_images.length)

      pieces = pieces.where('EXISTS (SELECT 1 FROM active_storage_attachments WHERE record_id = pieces.id AND record_type = "Piece")')

      pieces.each do |piece|
        next if added_piece_ids.include?(piece.id)

        added_piece_ids << piece.id
        image_urls = piece.images.map { |image| url_for(image) }

        pieces_with_images << piece.as_json(include: {
                                              user: { only: %i[id username], methods: [:avatar_url] },
                                              channel: { only: %i[id name] },
                                              votes: { only: %i[user_id vote_type] }
                                            }).merge(images: image_urls)

        break if pieces_with_images.length >= 4
      end

      days_to_look_back += 1
    end

    render json: pieces_with_images, include: { user: { only: %i[id username] } }
  end
end
