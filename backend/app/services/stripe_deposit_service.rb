class StripeDepositService
  def self.create_payment_intent(booking)
    stripe_secret_key = ENV['STRIPE_SECRET_KEY']

    if stripe_secret_key.present?
      Stripe.api_key = stripe_secret_key
      intent = Stripe::PaymentIntent.create({
        amount: booking.deposit_paid_cents,
        currency: 'usd',
        metadata: { booking_id: booking.id }
      })
      booking.update!(stripe_payment_intent_id: intent.id)
      intent.client_secret
    else
      mock_id = "pi_mock_#{SecureRandom.hex(8)}"
      booking.update!(stripe_payment_intent_id: mock_id)
      "mock_secret_#{SecureRandom.hex(16)}"
    end
  end

  def self.confirm_payment(payment_intent_id)
    booking = Booking.find_by(stripe_payment_intent_id: payment_intent_id)
    return false unless booking

    booking.update!(status: "scheduled")
    
    # Broadcast slots update via Action Cable
    begin
      slots_availabilities = SlotAvailabilityService.new(booking.time_slot.date, booking.time_slot.date).call
      slot_info = slots_availabilities.find { |s| s[:id] == booking.time_slot_id }
      
      ActionCable.server.broadcast("slots_channel", {
        type: "slot_update",
        slot: slot_info
      })
    rescue => e
      Rails.logger.error "Action Cable Broadcast failed: #{e.message}"
    end

    true
  end
end
