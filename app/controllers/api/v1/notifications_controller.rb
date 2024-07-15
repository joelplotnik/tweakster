require 'will_paginate/array'

class Api::V1::NotificationsController < ApplicationController
  before_action :authenticate_user!

  def index
     notifications = current_user.notifications.includes(event: { record: [:user, :piece] })
                        .order(created_at: :desc)
                        .paginate(page: params[:page], per_page: 10)

    notifications_data = notifications.map do |notification|
      base_data = notification.as_json(include: {
        event: {
          include: :record
        }
      })

      additional_data = if notification.event.record_type == 'Comment'
        {
          user_avatar_url: notification.event.record.user.avatar_url,
          username: notification.event.record.user.username,
          piece_id: notification.event.record.piece.id,
          piece_channel_id: notification.event.record.piece.channel_id,
          piece_title: notification.event.record.piece.title
        }
      elsif notification.event.record_type == 'Piece'
        {
          user_avatar_url: notification.event.record.user.avatar_url,
          username: notification.event.record.user.username,
          piece_id: notification.event.record.id,
          piece_channel_id: notification.event.record.channel_id,
          piece_title: notification.event.record.title,
          parent_piece_id: notification.event.record.parent_piece&.id,
          parent_piece_title: notification.event.record.parent_piece&.title
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
    
    render json: { has_unseen_notifications: has_unseen_notifications }
  end

  def mark_as_seen
    notification_ids = params[:notification_ids]
    notifications = current_user.notifications.where(id: notification_ids)
    notifications.update_all(seen_at: Time.current, read_at: Time.current)

    has_more_notifications = current_user.notifications.exists?(seen_at: nil)

    render json: { message: 'Notifications marked as seen', has_more_notifications: has_more_notifications }, status: :ok
  end
end
