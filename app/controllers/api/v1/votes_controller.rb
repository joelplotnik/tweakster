class Api::V1::VotesController < ApplicationController
    include Votable

    before_action :authenticate_user!

    rescue_from CanCan::AccessDenied do |exception|
      render json: { warning: exception }, status: :unauthorized
    end  
  
    def create
      existing_vote = current_user.votes.find_by(votable_type: vote_params[:votable_type], votable_id: vote_params[:votable_id])
  
      if existing_vote
        handle_existing_vote(existing_vote)
      else
        create_new_vote
      end
    end
  
    private
  
    def vote_params
      params.require(:vote).permit(:vote_type, :votable_id, :votable_type)
    end
  end
  