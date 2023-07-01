class Api::V1::CommentsController < ApplicationController
    load_and_authorize_resource
    before_action :authenticate_user!, except: [:index, :show]
  
    rescue_from CanCan::AccessDenied do |exception|
      render json: { warning: exception }, status: :unauthorized
    end

    def create
        comment = Comment.new(comment_params)
        comment.user = current_user
    
        if comment.save
          render json: comment, status: :created
        else
          render json: { error: comment.errors.full_messages }, status: :unprocessable_entity
        end
      end

    private

    def comment_params
        params.require(:comment).permit(:message, :piece_id)
    end
  
  end