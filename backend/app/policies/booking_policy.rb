class BookingPolicy < ApplicationPolicy
  def index?
    user&.admin? || user&.instructor?
  end

  def show?
    record.user_id == user&.id || record.guest_email == user&.email || user&.admin? || user&.instructor?
  end

  def create?
    true
  end

  def update?
    user&.admin? || user&.instructor?
  end

  def destroy?
    user&.admin?
  end

  def payment_intent?
    true
  end

  class Scope < Scope
    def resolve
      if user.admin? || user.instructor?
        scope.all
      else
        scope.where(user_id: user.id).or(scope.where(guest_email: user.email))
      end
    end
  end
end
