# app/controllers/concerns/votable.rb
module Votable
    extend ActiveSupport::Concern
  
    def handle_existing_vote(existing_vote)
      if existing_vote.vote_type.to_i == vote_params[:vote_type].to_i
        # User is trying to vote with the same type again, remove the vote
        existing_vote.destroy
        render json: { success: true, message: 'Vote removed' }
      else
        # User is trying to change their vote type, update the existing vote
        existing_vote.update(vote_type: vote_params[:vote_type])
        render json: { success: true, vote: existing_vote }
      end
    end
  
    def create_new_vote
      vote = Vote.new(vote_params)
      vote.user = current_user
  
      if vote.save
        render json: { success: true, vote: vote }
      else
        render json: { success: false, errors: vote.errors.full_messages }, status: :unprocessable_entity
      end
    end
end
  