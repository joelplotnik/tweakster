class Api::V1::RelationshipsController < ApplicationController
  def create
    user_to_follow = User.find(params[:id])

    if current_user == user_to_follow
      render json: { error: 'You cannot follow yourself.' }, status: :unprocessable_entity
    else
      relationship = Relationship.find_by(follower: current_user, followee: user_to_follow)

      if relationship
        render json: { message: "You are already following #{user_to_follow.username}" }
      else
        Relationship.create(follower: current_user, followee: user_to_follow)
        render json: { message: "You are now following #{user_to_follow.username}" }
      end
    end
  end

  def destroy
    user_to_unfollow = User.find(params[:id])
    relationship = current_user.followed_users.find_by(followee: user_to_unfollow)

    if relationship
      relationship.destroy

      if current_user.favorite_users.include?(user_to_unfollow.id)
        current_user.favorite_users.delete(user_to_unfollow.id)
        current_user.save
      end

      render json: { message: "You have unfollowed #{user_to_unfollow.username}" }
    else
      render json: { error: "You are not following #{user_to_unfollow.username}" }, status: :unprocessable_entity
    end
  end
end
