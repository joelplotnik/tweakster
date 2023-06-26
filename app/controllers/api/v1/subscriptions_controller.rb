class Api::V1::SubscriptionsController < ApplicationController
    before_action :authenticate_user!
  
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
  
    private
  
    def subscription_params
      params.require(:subscription).permit(:channel_id)
    end
  end
  