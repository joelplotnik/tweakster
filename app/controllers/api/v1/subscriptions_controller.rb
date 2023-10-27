class Api::V1::SubscriptionsController < ApplicationController
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

    def check_channel_subscription
      channel = Channel.find(params[:channel_id])
      user = current_user
  
      if user.subscriptions.exists?(channel: channel)
        render json: { message: 'Access granted' }, status: :ok
      else
        render json: { message: 'Access denied' }, status: :forbidden
      end
    end
  
    private
  
    def subscription_params
      params.require(:subscription).permit(:channel_id)
    end
  end
  