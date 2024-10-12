class ChannelSerializer
  include JSONAPI::Serializer
  attributes :id, :name, :platform, :description, :image_url
end
