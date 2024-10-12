# app/controllers/concerns/likeable.rb
module Likeable
  extend ActiveSupport::Concern

  def handle_existing_like(existing_like)
    existing_like.destroy
    render json: { success: true, message: 'Like removed' }
  end

  def create_new_like
    like = Like.new(like_params)
    like.user = current_user

    if like.save
      render json: { success: true, like: }
    else
      render json: { success: false, errors: like.errors.full_messages }, status: :unprocessable_entity
    end
  end
end
