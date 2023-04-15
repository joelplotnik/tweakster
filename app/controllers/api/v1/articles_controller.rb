class Api::V1::ArticlesController < ApplicationController
  def index
    @articles = Article.includes(:user).order(created_at: :desc)
    render json: @articles, include: { user: { only: [:id, :username] } }
  end

  def show
    @article = Article.includes(:user).find(params[:id])
    render json: @article, include: { user: { only: [:id, :username] } }
  end

  def create
    @article = Article.new(article_params)
    @article.user = User.first

    if @article.save
      render json: @article, include: { user: { only: [:id, :username] } }, status: :created
    else
      render json: { errors: @article.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    @article = Article.find(params[:id])

    if @article.update(params.require(:article).permit(:title, :content))
      render json: @article, include: { user: { only: [:id, :username] } }, status: :ok
    else
      render json: { errors: @article.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @article = Article.find(params[:id])
    @article.destroy
  end

  private

  def article_params
    params.require(:article).permit(:user, :title, :content)
  end
end
