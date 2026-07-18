class Api::V1::UsersController < Api::V1::BaseController
  def me
    render json: {
      user: {
        id: current_user.id,
        email: current_user.email,
        role: current_user.role,
        name: current_user.name,
        phone: current_user.phone
      }
    }
  end

  def update_role
    @user = User.find(params[:id])
    authorize @user, :update_role?

    if @user.update(role: params[:role])
      render json: {
        message: "User role updated successfully.",
        user: {
          id: @user.id,
          email: @user.email,
          role: @user.role,
          name: @user.name,
          phone: @user.phone
        }
      }
    else
      render json: { errors: @user.errors.full_messages }, status: :unprocessable_entity
    end
  end
end
