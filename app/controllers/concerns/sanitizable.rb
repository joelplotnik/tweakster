module Sanitizable
    extend ActiveSupport::Concern
  
    def sanitize_rich_content(content)
        Sanitize.fragment(content, Sanitize::Config::RELAXED)
    end
  
end
  