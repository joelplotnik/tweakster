class Api::V1::ArticlesController < ApplicationController
    def index
      @articles = Article.order(created_at: :desc)
      render json: @articles
    end
  
    def show
      @article = Article.find(params[:id])
      render json: @article
    end

    def create
      article = Article.new(article_params)
  
      if article.save
        render json: article, status: :created
      else
        render json: { errors: article.errors.full_messages }, status: :unprocessable_entity
      end
    end

    def edit
      @article = Article.find(params[:id])
    end
  
    private
  
    def article_params
      params.require(:article).permit(:user, :title, :content)
    end
  end
  