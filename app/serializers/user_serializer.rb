class UserSerializer
  include JSONAPI::Serializer
  attributes :id, :email, :username, :role, :avatar_url
end
