# frozen_string_literal: true

class Ability
  include CanCan::Ability

  def initialize(user)
    can :read, [User, Piece, Channel, Subscription, Comment, Vote]

    return unless user.present?  # additional permissions for logged in users
    can :manage, Piece, user: user # user can manage their own pieces
    can :manage, User, id: user.id # user can manage their own user account
    can :manage, Channel, user: user # user can manage their own channel
    can :manage, Subscription, user: user # user can manage their own subscription
    can :manage, Comment, user: user # user can manage their own comment
    can :manage, Vote, user: user # user can manage their own comment

    # Allow piece owners to manage comments on their pieces
    can :destroy, Comment, piece: { user_id: user.id }
    
    return unless user.admin?  # additional permissions for administrators
    can :manage, Piece # admin can manage all pieces
    can :manage, User  # admin can manage all users
    can :manage, Channel  # admin can manage all channels
    can :manage, Subscription # admin can manage all subscriptions
    can :manage, Comment # admin can manage all comments
    can :manage, Vote, user: user # admin can manage their all comments
  end
end