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
        end
      end

      resources :channels, only: [:show, :index, :create, :update, :destroy] do
        member do
          get 'check_ownership'
        end

        resources :pieces, only: [:show, :index, :create, :update, :destroy] do
          member do
            get 'check_ownership'
          end

          # Add comments routes
          resources :comments, only: [:index, :create]
        end

        # Add subscriptions routes
        post 'subscribe', to: 'subscriptions#create'
        delete 'unsubscribe', to: 'subscriptions#destroy'

      end
    end
  end
end
