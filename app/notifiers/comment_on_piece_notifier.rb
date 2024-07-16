# To deliver this notification:
#
# CommentOnPieceNotifier.with(record: @post, message: "New post").deliver(User.all)

class CommentOnPieceNotifier < ApplicationNotifier
  deliver_by :action_cable do |config|
    config.channel = 'NotificationsChannel'
    config.stream = -> { recipient }
    config.message = -> { params.merge(user_id: recipient.id) }
  end

  # Add required params
  #
  # required_param :message
end
