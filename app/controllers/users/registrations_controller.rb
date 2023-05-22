class Users::RegistrationsController < Devise::RegistrationsController
  respond_to :json

  def respond_with(resource, _opts = {})
    if resource.persisted?
      render json: {
        status: {
          code: 200,
          message: 'Signed up successfully',
          data: resource
        }
      }
    else
      render json: {
        status: {
          message: 'User could not be created successfully.',
          errors: resource.errors.full_messages
        }
      }, status: :unprocessable_entity
    end
  end
end
