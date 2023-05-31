class Api::V1::Users::RegistrationsController < Devise::RegistrationsController
  respond_to :json

  private

  def respond_with(resource, _opts = {})
    if resource.persisted?
      render json: {
        status: {
          code: 200,
          message: 'Successfully signed up user.',
          data: resource
        }
      }
    else
      render json: {
        status: {
          message: 'Could not sign up user.',
          errors: resource.errors.full_messages
        }
      }, status: :unprocessable_entity
    end
  end
end
