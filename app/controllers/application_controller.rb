class ApplicationController < ActionController::API
  before_action :doorkeeper_authorize!
  respond_to :json

  private

  def current_user
    return unless doorkeeper_token

    @current_user ||= User.find_by(id: doorkeeper_token[:resource_owner_id])
  end

  # before_action :configure_permitted_parameters, if: :devise_controller?

  # protected

  # def configure_permitted_parameters
  #   added_attrs = %i[username email password]
  #   devise_parameter_sanitizer.permit(:sign_up, keys: added_attrs)
  #   devise_parameter_sanitizer.permit(:account_update, keys: added_attrs)
  # end
end
