Rails.application.routes.draw do
  devise_for :users, path: 'api/v1/users', controllers: {
    sessions: 'api/v1/users/sessions',
    registrations: 'api/v1/users/registrations'
  }

  namespace :api do
    namespace :v1 do
      root 'home#index'

      get 'mischief_makers', to: 'home#mischief_makers'
      get 'personal_feed', to: 'home#personal_feed'

      resources :users, only: [:show, :index, :update, :destroy] do
        member do
          post 'follow', to: 'relationships#create'
          delete 'unfollow', to: 'relationships#destroy'
          get 'most_interacted_channels'
          get 'most_interacted_users'
          get 'subscriptions'
          get 'following'
          put 'update_favorite_users'
          put 'update_favorite_channels'
          get 'check_ownership'
        end
        
        collection do
          get 'search'
          get 'popular'
        end
      end

      resources :channels, only: [:show, :index, :create, :update, :destroy] do
        member do
          get 'check_ownership'
        end

        collection do
          get 'search'
          get 'popular'
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
          get 'check_user_subscriptions', to: 'subscriptions#check_user_subscriptions'
        end
      end

      resources :reports, only: [:create, :index]
    end
  end
end
