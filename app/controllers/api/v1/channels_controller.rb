class Api::V1::ChannelsController < ApplicationController
    load_and_authorize_resource
    before_action :authenticate_user!, except: [:index, :show]

    rescue_from CanCan::AccessDenied do |exception|
        render json: { warning: exception }, status: :unauthorized
    end

    def index
        channels = Channel.paginate(page: params[:page], per_page: 10).order(created_at: :asc).map do |channel|
            { id: channel.id, name: channel.name, total_users: channel.total_users }
        end
        render json: channels
    end

    def show
        channel = Channel.includes(pieces: :user).find(params[:id])
        pieces = channel.pieces.order(created_at: :desc).paginate(page: params[:page], per_page: 5).map do |piece|
          {
            id: piece.id,
            title: piece.title,
            content: piece.content,
            created_at: piece.created_at,
            user: {
              id: piece.user.id,
              username: piece.user.username
            }
          }
        end
      
        render json: {
          id: channel.id,
          name: channel.name,
          url: channel.url,
          protocol: channel.protocol,
          pieces: pieces,
          user: {
            id: channel.user.id,
            username: channel.user.username
          }
        }
      end      

    def create
        channel = Channel.new(channel_params)
        channel.user = current_user

        if channel.save
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
        params.require(:channel).permit(:name, :url, :protocol)
    end

end