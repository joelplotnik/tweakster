Rails.application.routes.draw do
  devise_for :users, controllers: {
    sessions: 'users/sessions',
    registrations: 'users/registrations'
  } 
  namespace :api do
    namespace :v1 do
      resources :articles, only: [:show, :index, :create, :update, :destroy]
      resources :users, only: [:show, :index, :destroy]
    end
  end
end