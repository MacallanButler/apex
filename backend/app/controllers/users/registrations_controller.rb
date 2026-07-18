class Users::RegistrationsController < Devise::RegistrationsController
  respond_to :json

  before_action :configure_sign_up_params, only: [:create]

  private

  def configure_sign_up_params
    devise_parameter_sanitizer.permit(:sign_up, keys: [:name, :phone])
  end

  def respond_with(resource, _opts = {})
    if resource.persisted?
      render json: {
        message: 'Signed up successfully.',
        user: {
          id: resource.id,
          email: resource.email,
          role: resource.role,
          name: resource.name,
          phone: resource.phone
        }
      }, status: :ok
    else
      render json: {
        message: "User could not be created.",
        errors: resource.errors.full_messages
      }, status: :unprocessable_entity
    end
  end
end
