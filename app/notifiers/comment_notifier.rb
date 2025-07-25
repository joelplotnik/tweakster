# To deliver this notification:
#
# CommentNotifier.with(record: @post, message: "New post").deliver(User.all)

class CommentNotifier < ApplicationNotifier
  deliver_by :action_cable do |config|
    config.channel = 'NotificationsChannel'
    config.stream = -> { recipient }
    config.message = -> { params.merge(user_id: recipient.id) }
  end

  # Add required params
  #
  # required_param :message
end
