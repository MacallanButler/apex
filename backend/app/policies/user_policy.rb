class UserPolicy < ApplicationPolicy
  def update_role?
    user&.admin?
  end
end
