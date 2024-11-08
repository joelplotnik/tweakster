Rails.application.routes.draw do
  use_doorkeeper
  devise_for :users, path: 'api/v1/users', controllers: {
      omniauth_callbacks: 'api/v1/users/omniauth_callbacks'
    }, skip: [:registrations]

  mount ActionCable.server => '/cable'

  root to: 'home#show'
  get '*path', to: 'home#show', constraints: ->(request) { request.format.html? }

  draw :api
end
