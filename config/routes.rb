Rails.application.routes.draw do
  devise_for :users, path: 'api/v1/users', controllers: {
    sessions: 'api/v1/users/sessions',
    registrations: 'api/v1/users/registrations'
  }

  namespace :api do
    namespace :v1 do
      resources :users, only: [:show, :index, :update, :destroy]
      resources :pieces, only: [:show, :index, :create, :update, :destroy]
    end
  end
end