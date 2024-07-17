module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :current_user

    def connect
      self.current_user = find_verified_user
    end

    protected

    def find_verified_user
      token = request.params[:token].split(' ').last

      if token
        begin
          # Decode the token using the secret key
          decoded_token = JWT.decode(token, Rails.application.secret_key_base).first
          user_id = decoded_token['sub']

          # Find the user based on the decoded token
          User.find(user_id)
        rescue JWT::DecodeError => e
          # Handle the case where token decoding fails
          logger.error "JWT decode error: #{e.message}"
          reject_unauthorized_connection
        end
      else
        reject_unauthorized_connection
      end
    end
  end
end
