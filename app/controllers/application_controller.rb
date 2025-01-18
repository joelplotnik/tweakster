class ApplicationController < ActionController::API
  respond_to :json

  def authenticate_devise_api_token_if_present!
    return if current_devise_api_token.present?

    @current_user = nil
  end

  def current_user
    current_devise_api_token&.resource_owner
  end
end
