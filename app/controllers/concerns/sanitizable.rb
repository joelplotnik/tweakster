module Sanitizable
  extend ActiveSupport::Concern

  def sanitize_rich_content(content)
    # Remove <p><br></p> pattern
    content.gsub!(%r{<p>\s*<br\s*/?>\s*</p>}, '')

    config = Sanitize::Config.merge(
      Sanitize::Config::RELAXED,
      attributes: {
        'a' => %w[href target] # Preserve 'href' and 'target' attributes for 'a' tags
        # Add other tags and attributes you want to preserve here
      }
    )

    Sanitize.fragment(content, config).gsub(/<a(.*?)>/, '<a target="_blank"\1>') # Ensure target="_blank"
  end
end
