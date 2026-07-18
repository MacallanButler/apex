class Api::V1::BookingsController < Api::V1::BaseController
  skip_before_action :authenticate_user!, only: [:create, :payment_intent]

  def index
    authorize Booking

    if params[:date].present?
      @bookings = Booking.joins(:time_slot).where(time_slots: { date: params[:date] })
    else
      @bookings = policy_scope(Booking)
    end

    render json: @bookings.as_json(include: { time_slot: { only: [:date, :time, :location] } })
  end

  def mine
    @bookings = Booking.where(user_id: current_user.id)
    render json: @bookings.as_json(include: { time_slot: { only: [:date, :time, :location] } })
  end

  def show
    @booking = Booking.find(params[:id])
    authorize @booking
    render json: @booking.as_json(include: [:time_slot, :waiver_acknowledgment])
  end

  def create
    booking_params_clean = booking_params
    user = current_user

    begin
      @booking = BookingCreationService.new(booking_params_clean, user).call
      render json: @booking.as_json(include: [:time_slot]), status: :created
    rescue => e
      render json: { error: e.message }, status: :unprocessable_entity
    end
  end

  def payment_intent
    @booking = Booking.find(params[:id])
    authorize @booking, :payment_intent?

    begin
      client_secret = StripeDepositService.create_payment_intent(@booking)
      render json: { client_secret: client_secret }
    rescue => e
      render json: { error: e.message }, status: :unprocessable_entity
    end
  end

  def update
    @booking = Booking.find(params[:id])
    authorize @booking

    if @booking.update(booking_update_params)
      begin
        ActionCable.server.broadcast("manifest_channel", {
          type: "booking_update",
          booking: @booking.as_json(include: { time_slot: { only: [:date, :time, :location] } })
        })
      rescue => e
        Rails.logger.error "Action Cable manifest broadcast failed: #{e.message}"
      end

      render json: @booking
    else
      render json: { errors: @booking.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def booking_params
    # ActionController::Parameters doesn't support array inside JSON naturally unless permitted explicitly
    # Permitting extras as an array parameter
    params.require(:booking).permit(
      :time_slot_id, :package, :instructor_id, :total_cents, :guest_name, :guest_email, :guest_phone,
      extras: [],
      waiver_acknowledgment_attributes: [:age_confirmed, :weight_confirmed, :health_confirmed, :alcohol_confirmed, :risk_acknowledged, :ip_address]
    )
  end

  def booking_update_params
    params.require(:booking).permit(:status, :instructor_id)
  end
end
