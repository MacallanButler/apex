class TimeSlot < ApplicationRecord
  has_many :bookings, dependent: :destroy

  validates :date, :time, :capacity, :location, presence: true
  validates :time, uniqueness: { scope: [:date, :location], message: "is already taken for this date and location" }
  validates :capacity, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
end
