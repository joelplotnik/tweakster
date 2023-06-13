# frozen_string_literal: true

class Ability
  include CanCan::Ability

  def initialize(user)
    can :read, [User, Piece, Channel]

    return unless user.present?  # additional permissions for logged in users
    can :manage, Piece, user: user # user can manage their own pieces
    can :manage, User, id: user.id # user can manage their own user account
    can :manage, Channel, user: user # user can manage their own channel
    
    return unless user.admin?  # additional permissions for administrators
    can :manage, Piece # admin can manage all pieces
    can :manage, User  # admin can manage all users
    can :manage, Channel  # admin can manage all channels
  end
end