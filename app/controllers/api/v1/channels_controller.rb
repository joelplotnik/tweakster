class Api::V1::ChannelsController < ApplicationController
    include Userable

    load_and_authorize_resource
    before_action :authenticate_user!, except: [:index, :show]

    rescue_from CanCan::AccessDenied do |exception|
        render json: { warning: exception }, status: :unauthorized
    end

    def index
        channels = Channel.paginate(page: params[:page], per_page: 20).order(created_at: :asc).map do |channel|
            { id: channel.id, name: channel.name, subscriptions_count: channel.subscriptions_count }
        end
        render json: channels
    end

    def show
        channel = Channel.includes(pieces: [:user, :votes]).find(params[:id])
        pieces = channel.pieces
                 .order(created_at: :desc)
                 .paginate(page: params[:page], per_page: 5)
                 .as_json(include: {
                   user: { only: [:id, :username], methods: [:avatar_url] },
                   votes: { only: [:user_id, :vote_type] }
                 })
                 
        subscribed = current_user && channel.subscriptions.exists?(user_id: current_user.id)
      
        render json: {
          id: channel.id,
          name: channel.name,
          url: channel.url,
          summary: channel.summary,
          protocol: channel.protocol,
          pieces: pieces,
          user: {
            id: channel.user.id,
            username: channel.user.username,
            avatar_url: channel.user.avatar_url
          },
          subscriber_count: channel.subscribers.count,
          subscribed: subscribed
        }
      end
      

    def create
        channel = Channel.new(channel_params)
        channel.user = current_user

        if channel.save
            channel.subscriptions.create(user: current_user)
            render json: channel, status: :created
        else
            render json: { errors: channel.errors.full_messages }, status: :unprocessable_entity
        end
    end

    def update
        channel = Channel.find(params[:id])

        if channel.update(channel_params)
            render json: channel, status: :ok
        else
            render json: { errors: channel.errors.full_messages }, status: :unprocessable_entity
        end
    end

    def destroy
        channel = Channel.find(params[:id])

        if channel.destroy
            render json: { message: 'Channel deleted successfully' }
        else
            render json: { error: 'Unable to delete the channel' }, status: :unprocessable_entity
        end
    end

    def check_ownership
        channel = Channel.find(params[:id])
        belongs_to_user = channel.user == current_user || current_user.admin?
        render json: { belongs_to_user: belongs_to_user }
    end

    private

    def channel_params
        params.require(:channel).permit(:name, :url, :summary, :protocol)
    end

end