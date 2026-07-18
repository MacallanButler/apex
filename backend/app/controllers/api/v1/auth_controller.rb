class Api::V1::AuthController < Api::V1::BaseController
  skip_before_action :authenticate_user!, only: [:guest_upgrade]

  def guest_upgrade
    email = params[:email]
    password = params[:password]
    name = params[:name]
    phone = params[:phone]

    if email.blank? || password.blank? || name.blank?
      return render json: { error: "Email, password, and name are required." }, status: :unprocessable_entity
    end

    User.transaction do
      user = User.new(email: email, password: password, name: name, phone: phone, role: :student)
      if user.save
        bookings = Booking.where(guest_email: email, user_id: nil)
        bookings.update_all(user_id: user.id)

        token, _payload = Warden::JWTAuth::UserEncoder.new.call(user, :user, nil)
        response.headers['Authorization'] = "Bearer #{token}"

        render json: {
          message: "Guest account upgraded successfully. #{bookings.count} bookings associated.",
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
            phone: user.phone
          }
        }, status: :ok
      else
        render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
      end
    end
  end
end
