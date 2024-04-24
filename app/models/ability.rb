# frozen_string_literal: true

class Ability
  include CanCan::Ability

  def initialize(user)
    can :read, [User, Piece, Channel, Subscription, Comment, Vote, Report] # allow users to view resources

    can :search, User # allow users to search for users
    can :popular, User # allow users to view popular users
    can :search, Channel # allow users to search for channels
    can :popular, Channel # allow users to view popular channels
    can :tweaks, Piece  # allow users to view tweaks

    return unless user.present?  # additional permissions for logged in users
    can :manage, Piece, user: user # user can manage their own pieces
    can :manage, User, id: user.id # user can manage their own user account
    can :manage, Channel, user: user # user can manage their own channel
    can :manage, Subscription, user: user # user can manage their own subscription
    can :manage, Comment, user: user # user can manage their own comment
    can :destroy, Comment, piece: { user_id: user.id } # piece owners can manage comments on their pieces
    can :manage, Vote, user: user # user can manage their own comment
    can :create, Report, reporter_id: user.id # user can create their own reports
    
    return unless user.admin?  # additional permissions for administrators
    can :manage, Piece # admin can manage all pieces
    can :manage, User  # admin can manage all users
    can :manage, Channel  # admin can manage all channels
    can :manage, Subscription # admin can manage all subscriptions
    can :manage, Comment # admin can manage all comments
    can :manage, Vote # admin can manage all votes
    can :manage, Report # admin can manage all reports

    # Permissions for managing favorites
    can :update_favorite_users, User
    can :update_favorite_channels, User
  end
end