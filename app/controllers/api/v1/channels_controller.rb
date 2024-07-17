class Api::V1::ChannelsController < ApplicationController
  include Channelable
  include Userable
  include Pieceable

  load_and_authorize_resource
  before_action :authenticate_user!, except: %i[index show search popular]

  rescue_from CanCan::AccessDenied do |exception|
    render json: { warning: exception }, status: :unauthorized
  end

  def index
    channels = Channel.paginate(page: params[:page],
                                per_page: 25).order(subscriptions_count: :desc).map do |channel|
      { id: channel.id, name: channel.name, subscriptions_count: channel.subscriptions_count,
        visual_url: channel.visual_url }
    end
    render json: channels
  end

  def popular
    limit = params[:limit] || 10

    channels = Channel.includes(pieces: %i[votes comments]).all

    channel_popularity_scores = Hash.new(0)

    channels.each do |channel|
      score = 0
      score += channel.pieces.where('created_at >= ?', Date.today).count
      score += channel.pieces.map { |piece| piece.comments.where('created_at >= ?', Date.today).count }.sum
      score += channel.pieces.map { |piece| piece.votes.where('created_at >= ?', Date.today).count }.sum
      channel_popularity_scores[channel] = score
    end

    sorted_channels = channel_popularity_scores.sort_by { |_, score| score }.reverse

    top_channels = []

    sorted_channels.each do |channel, _|
      top_channels << {
        id: channel.id,
        name: channel.name,
        subscriptions_count: channel.subscriptions_count,
        visual_url: channel.visual_url
      }
      break if top_channels.size == limit.to_i
    end

    if top_channels.size < limit.to_i
      remaining_channels = Channel.limit(limit.to_i - top_channels.size).order(subscriptions_count: :desc)
      remaining_channels.each do |channel|
        top_channels << {
          id: channel.id,
          name: channel.name,
          subscriptions_count: channel.subscriptions_count,
          visual_url: channel.visual_url
        }
      end
    end

    render json: top_channels
  end

  def search
    search_term = params[:search_term].downcase.strip
    channels = Channel.where('LOWER(name) LIKE ?', "#{search_term}%")

    channels = channels
               .paginate(page: params[:page], per_page: 5)
               .order(created_at: :asc)
               .map do |channel|
      {
        id: channel.id,
        name: channel.name,
        visual_url: channel.visual_url,
        subscriptions_count: channel.subscriptions_count
      }
    end

    render json: channels
  end

  def show
    channel = Channel.includes(pieces: %i[user votes]).find(params[:id])

    most_popular_channel = Channel.order(subscriptions_count: :desc).first
    popularity_percentage = (channel.subscriptions_count.to_f / most_popular_channel.subscriptions_count) * 100
    rounded_popularity_percentage = popularity_percentage.round

    pieces_with_images = channel.pieces
                                .where(parent_piece_id: nil)
                                .order(created_at: :desc)
                                .paginate(page: params[:page], per_page: 10)
                                .map do |piece|
      image_urls = piece.images.map { |image| url_for(image) }

      parent_piece_info = get_parent_piece_info(piece.parent_piece_id)

      highest_scoring_tweak_info = get_highest_scoring_tweak_piece(piece)

      piece_json = piece.as_json(only: %i[id title parent_piece_id content created_at upvotes downvotes channel_id
                                          comments_count tweaks_count youtube_url],
                                 include: {
                                   channel: { only: %i[id name] },
                                   user: { only: %i[id username], methods: [:avatar_url] },
                                   votes: { only: %i[user_id vote_type] }
                                 })

      piece_json['images'] = image_urls
      piece_json['parent_piece'] = parent_piece_info

      piece_json.merge!(tweak: highest_scoring_tweak_info) if highest_scoring_tweak_info.present?

      piece_json
    end

    channel_data = {
      id: channel.id,
      name: channel.name,
      visual_url: channel.visual_url,
      url: channel.url,
      summary: channel.summary,
      protocol: channel.protocol,
      user: {
        id: channel.user.id,
        username: channel.user.username,
        avatar_url: channel.user.avatar_url
      },
      subscriber_count: channel.subscribers.count,
      pieces: pieces_with_images,
      piece_count: channel.pieces.where(parent_piece_id: nil).count,
      popularity: rounded_popularity_percentage
    }

    if current_user
      channel_data['can_edit'] = current_user == channel.user || current_user.admin?
      channel_data['subscribed'] = channel.subscriptions.exists?(user_id: current_user.id)
    end

    render json: channel_data
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

    if params[:channel][:visual].present?
      channel.visual.attach(params[:channel][:visual])
    elsif params[:channel][:remove_visual] == 'true'
      channel.visual.purge
    end

    if channel.update(channel_params)
      channel_serializer = ChannelSerializer.new(channel).serializable_hash[:data][:attributes]
      render json: channel_serializer, status: :ok
    else
      render json: { errors: channel.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    channel = Channel.find(params[:id])

    unless current_user.admin?
      render json: { error: 'Permission denied. Only admins can delete channels.' }, status: :unauthorized
      return
    end

    if channel.destroy
      render json: { message: 'Channel deleted successfully' }
    else
      render json: { error: 'Unable to delete the channel' }, status: :unprocessable_entity
    end
  end

  def check_ownership
    channel = Channel.find(params[:id])
    belongs_to_user = channel.user == current_user || current_user.admin?
    render json: { belongs_to_user: }
  end

  private

  def channel_params
    params.require(:channel).permit(:visual, :name, :url, :summary, :protocol)
  end
end
