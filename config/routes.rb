Rails.application.routes.draw do
  devise_for :users, controllers: {
    sessions: 'users/sessions',
    registrations: 'users/registrations'
  } 
  namespace :api do
    namespace :v1 do
      resources :users, only: [:show, :index, :update, :destroy]
      resources :articles, only: [:show, :index, :create, :update, :destroy]
    end
  end
end