concern :challengeable do
  resources :challenges, param: :challenge_id, only: %i[show index create update destroy] do
    resources :votes, only: %i[create]
    resources :difficulty_ratings, only: [:create]

    resources :comments, only: %i[index create update destroy] do
      resources :likes, only: [:create]
      get 'replies', to: 'comments#replies', on: :member
    end

    resources :attempts, param: :attempts_id, only: %i[index create] do
      resources :approvals, only: [:create]

      resources :comments, only: %i[index create update destroy] do
        resources :likes, only: [:create]
      end
    end
  end
end

namespace :api do
  namespace :v1 do
    get 'me', to: 'users#me'
    get 'popular_users', to: 'users#popular_users'
    get 'popular_games', to: 'games#popular_games'
    get 'popular_challenges', to: 'challenges#popular_challenges'
    get 'popular_attempts', to: 'attempts#popular_attempts'

    resources :users, param: :user_id, only: %i[show index update destroy] do
      member do
        post 'follow', to: 'relationships#create'
        delete 'unfollow', to: 'relationships#destroy'
        get 'following'
        get 'check_ownership'

        resources :attempts, param: :attempts_id, only: %i[index show]
      end

      collection do
        get 'search'
      end

      concerns :challengeable
    end

    resources :games, param: :game_id, only: %i[show index create update destroy] do
      collection do
        get 'search'
      end

      concerns :challengeable
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
