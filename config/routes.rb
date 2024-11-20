Rails.application.routes.draw do
  devise_for :users, path: 'api/v1/users', controllers: {
    tokens: 'api/v1/users/tokens',
    omniauth_callbacks: 'api/v1/users/omniauth_callbacks'
  }

  mount ActionCable.server => '/cable'

  root to: 'home#show'
  get '*path', to: 'home#show', constraints: ->(request) { request.format.html? }

  draw :api
end
