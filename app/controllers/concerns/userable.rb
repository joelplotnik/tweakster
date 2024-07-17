module Userable
  extend ActiveSupport::Concern

  def avatar_url
    Rails.application.routes.url_helpers.url_for(avatar) if avatar.attached?
  end

  def calculate_integrity
    total_upvotes = pieces.sum(:upvotes) + comments.sum(:upvotes)
    total_downvotes = pieces.sum(:downvotes) + comments.sum(:downvotes)
    total_votes = total_upvotes + total_downvotes

    # Default starting integrity value
    default_integrity = 0.0

    if total_votes >= min_votes_threshold
      weighted_upvotes = calculate_weighted_votes(total_upvotes,
                                                  :piece) + calculate_weighted_votes(total_upvotes, :comment)
      weighted_downvotes = calculate_weighted_votes(total_downvotes,
                                                    :piece) + calculate_weighted_votes(total_downvotes, :comment)

      self.integrity = default_integrity + (weighted_upvotes.to_f / (weighted_upvotes + weighted_downvotes).to_f) * (100 - default_integrity)
    else
      self.integrity = default_integrity
    end
  end

  private

  def calculate_weighted_votes(votes, type)
    # Weights based on the type of contribution (piece or comment)
    weight = type == :piece ? piece_weight : comment_weight
    votes * weight
  end

  def min_votes_threshold
    # Minimum threshold for votes to have a meaningful impact on integrity
    10
  end

  def piece_weight
    # Weight for piece votes
    2
  end

  def comment_weight
    # Weight for comment votes
    1
  end
end
