class Api::V1::VotesController < ApplicationController
  include Votable

  def create
    existing_vote = current_user.votes.find_by(challenge_id: vote_params[:challenge_id])

    if existing_vote
      handle_existing_vote(existing_vote)
    else
      create_new_vote
    end
  end

  private

  def vote_params
    params.require(:vote).permit(:vote_type, :challenge_id)
  end
end
