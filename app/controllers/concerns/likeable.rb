module Likeable
  extend ActiveSupport::Concern

  def handle_existing_like(existing_like)
    existing_like.destroy
    render json: { success: true, message: 'Like removed successfully' }
  end

  def create_new_like
    like = current_user.likes.build(like_params)

    if like.save
      render json: { success: true, message: 'Like added successfully', like: }, status: :created
    else
      render json: { success: false, errors: like.errors.full_messages }, status: :unprocessable_entity
    end
  end
end
