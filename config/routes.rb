Rails.application.routes.draw do
  devise_for :users, path: 'api/v1/users', controllers: {
    sessions: 'api/v1/users/sessions',
    registrations: 'api/v1/users/registrations'
  }

  namespace :api do
    namespace :v1 do
      root 'home#index'

      resources :users, only: [:show, :index, :update, :destroy] do
        member do
          get 'check_ownership'
          post :impersonate
        end
        
        collection do
          post :stop_impersonating
        end
      end

      resources :channels, only: [:show, :index, :create, :update, :destroy] do
        member do
          get 'check_ownership'
          post 'subscribe', to: 'subscriptions#create'
          delete 'unsubscribe', to: 'subscriptions#destroy'
        end

        resources :pieces, only: [:show, :index, :create, :update, :destroy] do
          member do
            get 'check_ownership'
            get 'tweaks', to: 'pieces#tweaks'
          end

          resources :comments, only: [:index, :create, :update, :destroy] do
            member do
              get 'check_ownership'
            end
          end

          resources :votes, only: [:create]
        end
      end
    end
  end
end
