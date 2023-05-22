class Api::V1::UsersController < ApplicationController
  def index
    users = User.all.order(created_at: :asc).map do |user|
      { id: user.id, username: user.username, article_count: user.articles.count }
    end
    render json: users
  end

  def show
    user = User.find(params[:id])
    page = params[:page] || 1
    per_page = params[:per_page] || 5
    articles = user.articles.paginate(page: page, per_page: per_page).order(created_at: :desc)
    render json: {
      user: user,
      articles: articles.as_json(only: [:id, :title, :content, :created_at])
    }
  end

  def update
    user = User.find(params[:id])

    if user.update(user_params)
      render json: user, status: :ok
    else
      render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # def create
  #   user = User.new(user_params)
  
  #   if user.save
  #     render json: user, status: :created
  #   else
  #     render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
  #   end
  # end  

  private

  def user_params
    params.require(:user).permit(:username, :email, :password)
  end 
end
