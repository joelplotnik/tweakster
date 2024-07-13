class ApplicationController < ActionController::Base
  before_action :http_authenticate, if: :logging_in?

  private

  def http_authenticate
    return if Rails.env.development?

    authenticate_or_request_with_http_basic do |username, password|
      if username == ENV['BETA_USERNAME'] && password == ENV['BETA_PASSWORD']
        @allowed = true
        true
      else
        @allowed = false
        false
      end
    end
  end

  def logging_in?
    params[:login]
  end
end
