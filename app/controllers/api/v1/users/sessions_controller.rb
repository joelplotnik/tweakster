class Api::V1::Users::SessionsController < Devise::SessionsController
  respond_to :json

  private

  def respond_with(_resource, _options = {})
    render json: {
      status: {
        code: 200,
        message: 'Successfully signed in user.',
        data: current_user.as_json(methods: [:avatar_url])
      }
    }, status: :ok
  end

  def respond_to_on_destroy
    jwt_payload = JWT.decode(request.headers['Authorization'].split(' ')[1], Rails.application.secret_key_base).first
    current_user = User.find(jwt_payload['sub'])
    if current_user
      render json: {
        status: 200,
        message: 'Successfully signed out user.'
      }, status: :ok
    else
      render json: {
        status: 401,
        message: 'User has no active session.'
      }, status: :unauthorized
    end
  end
end
