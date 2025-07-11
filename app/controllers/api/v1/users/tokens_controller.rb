class Api::V1::Users::TokensController < Devise::Api::TokensController
  def sign_up
    unless Devise.api.config.sign_up.enabled
      error_response = Devise::Api::Responses::ErrorResponse.new(request, error: :sign_up_disabled,
                                                                          resource_class:)
      return render json: error_response.body, status: error_response.status
    end

    Devise.api.config.before_sign_up.call(sign_up_params, request, resource_class)

    service = Devise::Api::ResourceOwnerService::SignUp.new(params: sign_up_params, resource_class:).call

    if service.success?
      token = service.success
      user = token.resource_owner

      user.update_column(:password_set, true) if user.persisted? && user.encrypted_password.present?

      call_devise_trackable!(user)
      token_response = Devise::Api::Responses::TokenResponse.new(request, token:, action: __method__)
      Devise.api.config.after_successful_sign_up.call(user, token, request)
      return render json: token_response.body, status: token_response.status
    end

    error_response = Devise::Api::Responses::ErrorResponse.new(request, resource_class:,
                                                                        **service.failure)
    render json: error_response.body, status: error_response.status
  end

  # Sign in action
  def sign_in
    Devise.api.config.before_sign_in.call(sign_in_params, request, resource_class)

    service = Devise::Api::ResourceOwnerService::SignIn.new(params: sign_in_params, resource_class:).call

    if service.success?
      token = service.success
      call_devise_trackable!(token.resource_owner)
      token_response = Devise::Api::Responses::TokenResponse.new(request, token:, action: __method__)
      Devise.api.config.after_successful_sign_in.call(token.resource_owner, token, request)
      return render json: token_response.body, status: token_response.status
    end

    error_response = Devise::Api::Responses::ErrorResponse.new(request, resource_class:,
                                                                        **service.failure)
    render json: error_response.body, status: error_response.status
  end

  # Info action
  def info
    token_response = Devise::Api::Responses::TokenResponse.new(request, token: current_devise_api_token,
                                                                        action: __method__)
    render json: token_response.body, status: token_response.status
  end

  # Revoke action
  def revoke
    Devise.api.config.before_revoke.call(current_devise_api_token, request)

    service = Devise::Api::TokensService::Revoke.new(devise_api_token: current_devise_api_token).call

    if service.success?
      token_response = Devise::Api::Responses::TokenResponse.new(request, token: service.success, action: __method__)
      Devise.api.config.after_successful_revoke.call(service.success&.resource_owner, service.success, request)
      return render json: token_response.body, status: token_response.status
    end

    error_response = Devise::Api::Responses::ErrorResponse.new(request, resource_class:,
                                                                        **service.failure)
    render json: error_response.body, status: error_response.status
  end

  # Refresh action
  def refresh
    unless Devise.api.config.refresh_token.enabled
      error_response = Devise::Api::Responses::ErrorResponse.new(request, resource_class:,
                                                                          error: :refresh_token_disabled)
      return render json: error_response.body, status: error_response.status
    end

    if current_devise_api_refresh_token.blank?
      error_response = Devise::Api::Responses::ErrorResponse.new(request, error: :invalid_token,
                                                                          resource_class:)
      return render json: error_response.body, status: error_response.status
    end

    if current_devise_api_refresh_token.revoked?
      error_response = Devise::Api::Responses::ErrorResponse.new(request, error: :revoked_token,
                                                                          resource_class:)
      return render json: error_response.body, status: error_response.status
    end

    Devise.api.config.before_refresh.call(current_devise_api_refresh_token, request)

    service = Devise::Api::TokensService::Refresh.new(devise_api_token: current_devise_api_refresh_token).call

    if service.success?
      token_response = Devise::Api::Responses::TokenResponse.new(request, token: service.success, action: __method__)
      Devise.api.config.after_successful_refresh.call(service.success.resource_owner, service.success, request)
      return render json: token_response.body, status: token_response.status
    end

    error_response = Devise::Api::Responses::ErrorResponse.new(request, resource_class:,
                                                                        **service.failure)
    render json: error_response.body, status: error_response.status
  end

  private

  # Sign-up parameters allowing for username
  def sign_up_params
    params.permit(:username, *Devise.api.config.sign_up.extra_fields, *resource_class.authentication_keys,
                  *::Devise::ParameterSanitizer::DEFAULT_PERMITTED_ATTRIBUTES[:sign_up]).to_h
  end

  # Sign-in parameters
  def sign_in_params
    params.permit(*resource_class.authentication_keys,
                  *::Devise::ParameterSanitizer::DEFAULT_PERMITTED_ATTRIBUTES[:sign_in]).to_h
  end

  # Trackable callback
  def call_devise_trackable!(resource_owner)
    return unless resource_class.supported_devise_modules.trackable?

    resource_owner.update_tracked_fields!(request)
  end

  # Refresh token retrieval
  def current_devise_api_refresh_token
    return @current_devise_api_refresh_token if @current_devise_api_refresh_token

    token = find_devise_api_token
    devise_api_token_model = Devise.api.config.base_token_model.constantize
    @current_devise_api_refresh_token = devise_api_token_model.find_by(refresh_token: token)
  end
end
