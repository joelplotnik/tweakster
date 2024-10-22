# frozen_string_literal: true

class Ability
  include CanCan::Ability

  def initialize(user)
    # allow users to view resources
    can :read, [User, Game, Challenge, AcceptedChallenge, Comment, Like, Approval, Difficulty, Report]
    can :search, User # allow users to search for users
    can :search, Game # allow users to search for games
    can :popular_games, Game # allow users to view popular games
    can :popular_challenges, Challenge # allow users to view popular challenges
    can :popular_accepted_challenges, AcceptedChallenge # allow users to view popular accepted challenges
    can :popular_users, User # allow users to view popular users
    can :replies, Comment # allow users to view comment replies

    return unless user.present? # additional permissions for logged in users

    can :manage, User, id: user.id # user can manage their own user account
    can :update_favorite_games, User # allow users to update their favorite games
    can(:manage, Challenge, user:) # user can manage their own challeneges
    can(:manage, AcceptedChallenge, user:) # user can manage their own accepted challenges
    can :manage, Comment, user_id: user.id # user can manage their own comments
    can :destroy, Comment, commentable: { user_id: user.id } # challenge owners can delete comments on their commentables
    can(:manage, Like, user:) # user can manage their own likes
    can(:manage, Approval, user:) # user can manage their own approvals
    can(:manage, Difficulty, user:) # user can manage their own difficulty ratings
    can :create, Report, reporter_id: user.id # user can create their own reports

    return unless user.admin? # additional permissions for administrators

    can :manage, User # admin can manage all users
    can :manage, Game # admin can manage all channels
    can :manage, Challenge # admin can manage all subscriptions
    can :manage, AcceptedChallenge # admin can manage all subscriptions
    can :manage, Comment # admin can manage all comments
    can :manage, Like # admin can manage all likes
    can :manage, Approval # admin can manage all approvals
    can :manage, Difficulty # admin can manage all difficulties
    can :manage, Report # admin can manage all reports
  end
end
