module Tweakable
  extend ActiveSupport::Concern

  def calculate_tweak_score(tweak)
    upvotes = tweak.votes.where(vote_type: 1).count
    downvotes = tweak.votes.where(vote_type: -1).count
    upvotes - downvotes
  end
end
