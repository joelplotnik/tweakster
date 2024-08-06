require 'will_paginate/array'

class Api::V1::NotificationsController < ApplicationController
  before_action :authenticate_user!

  def index
    notifications = current_user.notifications.includes(event: { record: { user: [], piece: [], tweak: [] } })
                                .order(created_at: :desc)
                                .paginate(page: params[:page], per_page: 10)

    notifications_data = notifications.map do |notification|
      base_data = notification.as_json(include: {
                                         event: {
                                           include: :record
                                         }
                                       })

      additional_data = case notification.event.record_type
                        when 'Comment'
                          record = notification.event.record
                          {
                            user_avatar_url: record.user.avatar_url,
                            username: record.user.username,
                            piece_id: record.commentable_id,
                            piece_channel_id: record.commentable.channel_id,
                            piece_title: record.commentable.title
                          }
                        when 'Piece'
                          record = notification.event.record
                          {
                            user_avatar_url: record.user.avatar_url,
                            username: record.user.username,
                            piece_id: record.id,
                            piece_channel_id: record.channel_id,
                            piece_title: record.title
                          }
                        else
                          {}
                        end

      base_data.merge(additional_data)
    end

    render json: notifications_data
  end

  def unseen
    has_unseen_notifications = current_user.notifications.exists?(seen_at: nil)

    render json: { has_unseen_notifications: }
  end

  def mark_as_seen
    notification_ids = params[:notification_ids]
    notifications = current_user.notifications.where(id: notification_ids)
    notifications.update_all(seen_at: Time.current, read_at: Time.current)

    has_more_notifications = current_user.notifications.exists?(seen_at: nil)

    render json: { message: 'Notifications marked as seen', has_more_notifications: },
           status: :ok
  end
end
