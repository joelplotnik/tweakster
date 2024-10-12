module Userable
  extend ActiveSupport::Concern

  def avatar_url
    Rails.application.routes.url_helpers.url_for(avatar) if avatar.attached?
  end
end
