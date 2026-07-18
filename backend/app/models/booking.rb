class Booking < ApplicationRecord
  belongs_to :user, optional: true
  belongs_to :time_slot
  belongs_to :instructor, class_name: "User", foreign_key: :instructor_id, optional: true
  has_one :waiver_acknowledgment, dependent: :destroy

  accepts_nested_attributes_for :waiver_acknowledgment

  serialize :extras, type: Array, coder: JSON

  enum :package, { tandem: "tandem", solo: "solo", sunset: "sunset" }
  enum :status, { pending_payment: "pending_payment", scheduled: "scheduled", completed: "completed", cancelled: "cancelled" }, default: "pending_payment"

  validates :package, :total_cents, :status, presence: true
  validates :total_cents, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validate :user_or_guest_details_present

  private

  def user_or_guest_details_present
    if user_id.blank? && (guest_name.blank? || guest_email.blank?)
      errors.add(:base, "Either a registered user or guest name/email must be provided")
    end
  end
end
