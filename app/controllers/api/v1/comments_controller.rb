require 'will_paginate/array'

class Api::V1::CommentsController < ApplicationController
  load_and_authorize_resource except: :index
  before_action :authenticate_user!, except: [:index, :show]

  rescue_from CanCan::AccessDenied do |exception|
    render json: { warning: exception }, status: :unauthorized
  end

  def index
    piece = Piece.find(params[:piece_id])
    comments = piece.comments.includes(:user, :votes)
  
    # Calculate the score for each comment and store them in an array with additional information
    comments_with_info = comments.map do |comment|
      score = calculate_comment_score(comment)
      { comment: comment, score: score, child_comments: [] }
    end
  
    # Sort the comments based on their scores, with the highest score first
    sorted_comments = comments_with_info.sort_by { |comment_info| -comment_info[:score] }
  
    # Create a hash to store the comments under their IDs
    comments_by_id = {}
    sorted_comments.each { |comment_info| comments_by_id[comment_info[:comment].id] = comment_info }
  
    # Build the tree structure by adding child_comments to their respective parent comments
    sorted_comments.each do |comment_info|
      parent_id = comment_info[:comment].parent_comment_id
      next unless parent_id
  
      parent_comment_info = comments_by_id[parent_id]
      parent_comment_info[:child_comments] << comment_info
    end
  
    # Get the root comments (comments without parents) for rendering
    root_comments = sorted_comments.reject { |comment_info| comment_info[:comment].parent_comment_id }
    paginated_comments = root_comments.paginate(page: params[:page], per_page: 10)
  
    render json: paginated_comments, include: {
      user: { only: [:username] },
      votes: { only: [:user_id, :vote_type] },
      child_comments: {
        include: {
          user: { only: [:username] },
          votes: { only: [:user_id, :vote_type] }
        }
      }
    }
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
      render json: comment.as_json(include: { user: { only: :username } }), status: :ok
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

  def calculate_comment_score(comment)
    likes = comment.votes.where(vote_type: 1).count
    dislikes = comment.votes.where(vote_type: -1).count
    likes - dislikes
  end

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
