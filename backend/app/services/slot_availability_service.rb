class SlotAvailabilityService
  def initialize(date_from, date_to)
    @date_from = date_from
    @date_to = date_to
  end

  def call
    slots = TimeSlot.where(date: @date_from..@date_to)
    weather_status = WeatherReading.order(recorded_at: :desc).first&.status || "go"

    slots.map do |slot|
      bookings_count = slot.bookings.where.not(status: :cancelled).count
      
      effective_capacity = slot.capacity
      if weather_status == "no_go"
        effective_capacity = 0
      elsif weather_status == "marginal"
        effective_capacity = (slot.capacity * 0.7).floor
      end

      remaining = [effective_capacity - bookings_count, 0].max

      {
        id: slot.id,
        date: slot.date,
        time: slot.time,
        capacity: slot.capacity,
        effective_capacity: effective_capacity,
        remaining: remaining,
        location: slot.location,
        weather_status: weather_status
      }
    end
  end
end
