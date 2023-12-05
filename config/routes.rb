Rails.application.routes.draw do
  devise_for :users, path: 'api/v1/users', controllers: {
    sessions: 'api/v1/users/sessions',
    registrations: 'api/v1/users/registrations'
  }

  namespace :api do
    namespace :v1 do
      root 'home#index'

      get 'mischief_makers', to: 'home#mischief_makers'

      resources :users, only: [:show, :index, :update, :destroy] do
        member do
          get 'check_ownership'
          post 'follow', to: 'relationships#create'
          delete 'unfollow', to: 'relationships#destroy'
        end
        
        collection do
          get 'search', to: 'users#search'
        end
      end

      resources :channels, only: [:show, :index, :create, :update, :destroy] do
        member do
          get 'check_ownership'
        end

        collection do
          get 'search', to: 'channels#search'
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

        post 'subscribe', to: 'subscriptions#create'
        delete 'unsubscribe', to: 'subscriptions#destroy'
        get 'check_channel_subscription', to: 'subscriptions#check_channel_subscription'
      end

      resources :subscriptions, only: [:index] do
        collection do
          get 'subscribed_pieces', to: 'subscriptions#subscribed_pieces'
        end
      end
    end
  end
end
