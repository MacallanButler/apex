class BookingCreationService
  def initialize(params, user = nil)
    @params = params
    @user = user
  end

  def call
    Booking.transaction do
      time_slot = TimeSlot.lock("FOR UPDATE").find(@params[:time_slot_id])

      bookings_count = time_slot.bookings.where.not(status: :cancelled).count
      weather_status = WeatherReading.order(recorded_at: :desc).first&.status || "go"

      effective_capacity = time_slot.capacity
      if weather_status == "no_go"
        effective_capacity = 0
      elsif weather_status == "marginal"
        effective_capacity = (time_slot.capacity * 0.7).floor
      end

      remaining = [effective_capacity - bookings_count, 0].max

      if remaining <= 0
        raise StandardError, "This time slot is fully booked or unavailable due to weather."
      end

      booking = Booking.new(@params.except(:waiver_acknowledgment_attributes))
      booking.user = @user if @user
      booking.status = "pending_payment"
      booking.deposit_paid_cents = (booking.total_cents * 0.3).round

      # Build waiver acknowledgment
      if @params[:waiver_acknowledgment_attributes].present?
        waiver_params = @params[:waiver_acknowledgment_attributes]
        booking.build_waiver_acknowledgment(
          age_confirmed: waiver_params[:age_confirmed],
          weight_confirmed: waiver_params[:weight_confirmed],
          health_confirmed: waiver_params[:health_confirmed],
          alcohol_confirmed: waiver_params[:alcohol_confirmed],
          risk_acknowledged: waiver_params[:risk_acknowledged],
          ip_address: waiver_params[:ip_address] || "127.0.0.1",
          signed_at: Time.current
        )
      end

      booking.save!
      booking
    end
  end
end
