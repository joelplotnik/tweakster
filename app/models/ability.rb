# frozen_string_literal: true

class Ability
  include CanCan::Ability

  def initialize(user)
    can :read, [User, Piece]

    return unless user.present?  # additional permissions for logged in users (they can manage their own posts)
    can :manage, Piece, user: user # user can manage their own pieces
    can :manage, User, id: user.id # user can manage their own user account
    
    return unless user.admin?  # additional permissions for administrators
    can :manage, Piece # admin can manage all pieces
    can :manage, User  # admin can manage all users
  end
end