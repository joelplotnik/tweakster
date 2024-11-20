module Devise::Api::Responses::TokenResponseDecorator
  def body
    default_body.merge(
      resource_owner: resource_owner_data
    )
  end

  private

  def resource_owner_data
    {
      id: resource_owner.id,
      email: resource_owner.email,
      username: resource_owner.username,
      avatar_url: resource_owner.avatar_url,
      role: resource_owner.role,
      created_at: resource_owner.created_at,
      updated_at: resource_owner.updated_at
    }
  end
end
