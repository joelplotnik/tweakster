Rails.application.routes.draw do
  use_doorkeeper
  devise_for :users
  mount ActionCable.server => '/cable'

  root to: 'home#show'
  get '*path', to: 'home#show', constraints: ->(request) { request.format.html? }

  draw :api
end
