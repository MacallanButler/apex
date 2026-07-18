Rails.application.routes.draw do
  devise_for :users, path: 'api/v1/auth', path_names: {
    sign_in: 'login',
    sign_out: 'logout',
    registration: 'register'
  }, controllers: {
    sessions: 'users/sessions',
    registrations: 'users/registrations'
  }

  namespace :api, defaults: { format: :json } do
    namespace :v1 do
      post 'auth/guest_upgrade', to: 'auth#guest_upgrade'
      get 'auth/me', to: 'users#me'

      resources :time_slots, only: [:index, :show, :create, :update, :destroy]
      
      resources :bookings, only: [:index, :show, :create, :update] do
        member do
          post :payment_intent
        end
        collection do
          get :mine
        end
      end

      get 'weather/current', to: 'weather#current'
      post 'webhooks/stripe', to: 'webhooks#stripe'

      patch 'users/:id/role', to: 'users#update_role'
    end
  end

  get "up" => "rails/health#show", as: :rails_health_check

  # Defines the root path route ("/")
  # root "posts#index"
end
