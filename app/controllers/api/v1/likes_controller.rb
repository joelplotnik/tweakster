class Api::V1::LikesController < ApplicationController
  include Likeable

  before_action :authenticate_user!

  rescue_from CanCan::AccessDenied do |exception|
    render json: { warning: exception }, status: :unauthorized
  end

  def create
    existing_like = current_user.likes.find_by(likeable_type: like_params[:likeable_type],
                                               likeable_id: like_params[:likeable_id])

    if existing_like
      handle_existing_like(existing_like)
    else
      create_new_like
    end
  end

  private

  def like_params
    params.require(:like).permit(:likeable_id, :likeable_type)
  end
end
