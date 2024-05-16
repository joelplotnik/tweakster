class MessagesChannel < ApplicationCable::Channel
  def subscribed
    user = current_user
    
    puts "CURRENT USER: ", user.username

    stream_from "MessagesChannel"
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end
end
