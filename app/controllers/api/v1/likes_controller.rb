class Api::V1::LikesController < ApplicationController
  include Likeable
  skip_before_action :verify_authenticity_token, raise: false
  before_action :authenticate_devise_api_token!, only: %i[create]

  def create
    existing_like = current_user.likes.find_by(comment_id: like_params[:comment_id])

    if existing_like
      handle_existing_like(existing_like)
    else
      create_new_like
    end
  end

  private

  def like_params
    params.require(:like).permit(:comment_id)
  end
end
