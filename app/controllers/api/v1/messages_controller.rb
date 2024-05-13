class Api::V1::MessagesController < ApplicationController
  before_action :authenticate_user! 

  def index
    conversation_users = current_user.conversations.paginate(page: params[:page], per_page: 25)
    render json: formatted_conversations(conversation_users)
  end

  def show
    receiver = User.find(params[:id])
    messages = current_user.messages_with(receiver).order(created_at: :desc).paginate(page: params[:page], per_page: 15).reverse
    render json: formatted_messages(messages)
  end  

  def create
    message = current_user.sent_messages.build(message_params)
    if message.save
      render json: formatted_message(message), status: :created
    else
      render json: { error: message.errors.full_messages.join(', ') }, status: :unprocessable_entity
    end
  end

  def destroy
    user = User.find(params[:id])

    messages_to_destroy = current_user.messages_with(user)
    messages_to_destroy.destroy_all

    render json: { message: 'Messages destroyed successfully' }
  end

  private

  def message_params
    params.require(:message).permit(:receiver_id, :body)
  end

  def formatted_message(message)
    {
      id: message.id,
      sender_id: message.sender_id,
      receiver_id: message.receiver_id,
      body: message.body,
      read: message.read,
      avatar_url: message.sender.avatar_url
    }
  end

  def formatted_conversations(users)
    users.map do |user|
      most_recent_unread_message = current_user.messages_with(user).where(receiver_id: current_user.id, read: false).order(created_at: :desc).first
      unread_count = current_user.messages_with(user).where(receiver_id: current_user.id, read: false).count
  
      {
        id: user.id,
        username: user.username,
        avatar_url: user.avatar_url,
        unread_count: unread_count,
        most_recent_unread_message: most_recent_unread_message&.created_at
      }
    end.sort_by { |conversation| conversation[:most_recent_unread_message] }.reverse
  end
  

  def formatted_messages(messages)
    messages.map do |message|
      {
        id: message.id,
        sender_id: message.sender_id,
        receiver_id: message.receiver_id,
        body: message.body,
        read: message.read,
        avatar_url: message.sender.avatar_url, 
      }
    end
  end
end
