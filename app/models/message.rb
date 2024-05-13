class Message < ApplicationRecord
    after_create_commit { broadcast_message }

    belongs_to :sender, class_name: 'User'
    belongs_to :receiver, class_name: 'User'

    private

    def broadcast_message
      ActionCable.server.broadcast("MessagesChannel", {
        id: id,
        sender_id: sender_id,
        receiver_id: receiver_id,
        body: body,
        avatar_url: sender.avatar_url,
        created_at: created_at
      })
    end
end
