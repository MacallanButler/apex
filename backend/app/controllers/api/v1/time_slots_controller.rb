class Api::V1::TimeSlotsController < Api::V1::BaseController
  skip_before_action :authenticate_user!, only: [:index, :show]

  def index
    date_from = params[:date_from].present? ? Date.parse(params[:date_from]) : Date.today
    date_to = params[:date_to].present? ? Date.parse(params[:date_to]) : (date_from + 30.days)

    @slots = SlotAvailabilityService.new(date_from, date_to).call
    render json: @slots
  end

  def show
    @slot = TimeSlot.find(params[:id])
    render json: @slot
  end

  def create
    @slot = TimeSlot.new(time_slot_params)
    authorize @slot

    if @slot.save
      render json: @slot, status: :created
    else
      render json: { errors: @slot.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    @slot = TimeSlot.find(params[:id])
    authorize @slot

    if @slot.update(time_slot_params)
      render json: @slot
    else
      render json: { errors: @slot.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @slot = TimeSlot.find(params[:id])
    authorize @slot
    @slot.destroy
    head :no_content
  end

  private

  def time_slot_params
    params.require(:time_slot).permit(:date, :time, :capacity, :location)
  end
end
