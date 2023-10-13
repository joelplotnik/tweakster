class ChannelSerializer
  include JSONAPI::Serializer
  attributes :id, :name, :url, :summary, :protocol, :visual_url
end
