require 'will_paginate/array'

class Api::V1::CommentsController < ApplicationController
  load_and_authorize_resource except: :index
  before_action :authenticate_user!, except: [:index, :show]

  rescue_from CanCan::AccessDenied do |exception|
    render json: { warning: exception }, status: :unauthorized
  end

  def index
    piece = Piece.find(params[:piece_id])
    comments = piece.comments.includes(:user).order(created_at: :asc)
  
    parent_comments = comments.select { |comment| comment.parent_comment_id.nil? }
    all_comments = []
  
    parent_comments.each do |parent_comment|
      all_comments << parent_comment
      all_comments += build_comment_tree(parent_comment)
    end
  
    paginated_comments = all_comments.paginate(page: params[:page], per_page: 10)
    render json: paginated_comments, include: { user: { only: [:username] } }
  end

  def create
    comment = Comment.new(comment_params)
    comment.user = current_user

    if comment.save
      render json: comment, include: { user: { only: [:username] } }, status: :created
    else
      render json: { error: comment.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    comment = Comment.find(params[:id])
  
    if comment.update(comment_params)
      render json: comment, status: :ok
    else
      render json: { error: comment.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    comment = Comment.find(params[:id])
    comment.destroy
  
    if comment.destroyed?
      render json: { message: 'Comment and its children successfully deleted' }, status: :ok
    else
      render json: { error: 'Failed to delete comment' }, status: :unprocessable_entity
    end
  end

  def check_ownership
    comment = Comment.find(params[:id])
    belongs_to_user = comment.user == current_user || current_user.admin?
    render json: { belongs_to_user: belongs_to_user }
  end

  private

  def build_comment_tree(comment)
    children = comment.child_comments
    return [] if children.empty?
  
    tree = []
    children.each do |child|
      tree << child
      tree += build_comment_tree(child)
    end
  
    tree
  end

  def comment_params
    params.require(:comment).permit(:message, :piece_id, :parent_comment_id)
  end
end
