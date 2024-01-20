require 'will_paginate/array'

class Api::V1::SubscriptionsController < ApplicationController
    include Pieceable

    before_action :authenticate_user!

    def index
      user_subscriptions = current_user.subscriptions.includes(:channel)
      subscribed_channels = user_subscriptions.map { |subscription| subscription.channel }
      render json: subscribed_channels, each_serializer: ChannelSerializer
    end
  
    def create
      channel = Channel.find(subscription_params[:channel_id])
      subscription = channel.subscriptions.build(user: current_user)
  
      if subscription.save
        render json: { message: 'Successfully subscribed to the channel' }, status: :created
      else
        render json: { errors: subscription.errors.full_messages }, status: :unprocessable_entity
      end
    end
  
    def destroy
      channel = Channel.find(subscription_params[:channel_id])
      subscription = channel.subscriptions.find_by(user: current_user)
  
      if subscription
        subscription.destroy
        render json: { message: 'Successfully unsubscribed from the channel' }
      else
        render json: { error: 'Subscription not found' }, status: :not_found
      end
    end

    def subscribed_pieces
      user = current_user
    
      subscribed_channels = user.subscriptions.map(&:channel)
    
      subscribed_pieces = Piece.where(channel: subscribed_channels)
    
      sorted_subscribed_pieces = if params[:sort] == 'new'
        subscribed_pieces.order(created_at: :desc)
      else
        subscribed_pieces.sort_by { |piece| calculate_piece_score(piece) }.reverse
      end
    
      paginated_subscribed_pieces = sorted_subscribed_pieces.paginate(page: params[:page], per_page: 10)
    
      pieces_with_images = paginated_subscribed_pieces.map do |piece|
        image_urls = piece.images.map { |image| url_for(image) }
    
        parent_piece_info = get_parent_piece_info(piece.parent_piece_id)
    
        piece.as_json(include: {
          user: {
            only: [:id, :username],
            methods: [:avatar_url] 
          },
          channel: { only: [:id, :name] },
          votes: { only: [:user_id, :vote_type] }
        }).merge({ 
          images: image_urls,
          parent_piece: parent_piece_info
        })
      end
    
      render json: pieces_with_images
    end
    

    def check_channel_subscription
      channel = Channel.find(params[:channel_id])
      user = current_user
  
      if user.subscriptions.exists?(channel: channel)
        render json: { message: 'Access granted' }, status: :ok
      else
        render json: { message: 'Access denied' }, status: :forbidden
      end
    end

    def check_user_subscriptions
      user = current_user
  
      if user.subscriptions.present?
        render json: { hasSubscriptions: true }, status: :ok
      else
        render json: { hasSubscriptions: false }, status: :ok
      end
    end
  
    private
  
    def subscription_params
      params.require(:subscription).permit(:channel_id)
    end
  end
  