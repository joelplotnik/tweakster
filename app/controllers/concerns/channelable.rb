module Channelable
    extend ActiveSupport::Concern
  
    def visual_url
      Rails.application.routes.url_helpers.url_for(visual) if visual.attached?
    end
end