Rails.application.routes.draw do
  mount ActionCable.server => '/cable'
  devise_for :users, path: 'api/v1/users', controllers: {
    sessions: 'api/v1/users/sessions',
    registrations: 'api/v1/users/registrations'
  }

  namespace :api do
    namespace :v1 do
      get 'popular_users', to: 'users#popular_users'
      get 'popular_games', to: 'games#popular_games'
      get 'popular_challenges', to: 'challenges#popular_challenges'
      get 'popular_accepted_challenges', to: 'accepted_challenges#popular_accepted_challenges'

      resources :users, only: %i[show index update destroy] do
        member do
          post 'follow', to: 'relationships#create'
          delete 'unfollow', to: 'relationships#destroy'
          get 'following'
          put 'update_favorite_games'
          get 'check_ownership'
        end

        collection do
          get 'search'
        end

        resources :accepted_challenges, only: %i[index show update destroy] do
          resources :approvals, only: [:create]

          resources :comments, only: %i[index create update destroy] do
            resources :likes, only: [:create]
            get 'replies', to: 'comments#replies', on: :member
          end
        end
      end

      resources :games, only: %i[show index create update destroy] do
        collection do
          get 'search'
        end

        resources :challenges, only: %i[show index create update destroy] do
          resources :likes, only: [:create]
          resources :difficulty_ratings, only: [:create]

          resources :comments, only: %i[index create update destroy] do
            resources :likes, only: [:create]
            get 'replies', to: 'comments#replies', on: :member
          end

          resources :accepted_challenges, only: %i[index create] do
            resources :approvals, only: [:create]

            resources :comments, only: %i[index create update destroy] do
              resources :likes, only: [:create]
            end
          end
        end
      end

      resources :notifications, only: [:index] do
        collection do
          get 'unseen'
          post 'mark_as_seen'
        end
      end

      resources :reports, only: %i[index create destroy]
    end
  end

  root to: 'home#show'
  get '*path', to: 'home#show', constraints: ->(request) { request.format.html? }
end
