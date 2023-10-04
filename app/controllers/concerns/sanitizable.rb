module Sanitizable
    extend ActiveSupport::Concern
  
    def sanitize_rich_content(content)
      config = Sanitize::Config.merge(
        Sanitize::Config::RELAXED,
        attributes: {
          'a' => ['href', 'target'] # Preserve 'href' and 'target' attributes for 'a' tags
          # Add other tags and attributes you want to preserve here
        }
      )
  
      Sanitize.fragment(content, config).gsub(/<a(.*?)>/, '<a target="_blank"\1>') # Ensure target="_blank"
    end
  end
  