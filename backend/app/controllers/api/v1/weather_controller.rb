class Api::V1::WeatherController < Api::V1::BaseController
  skip_before_action :authenticate_user!, only: [:current]

  def current
    @reading = WeatherReading.order(recorded_at: :desc).first
    if @reading
      render json: @reading
    else
      render json: {
        recorded_at: Time.current,
        wind_kts: 10,
        ceiling_ft: 10000,
        temp_f: 72,
        visibility: "10sm",
        status: "go"
      }
    end
  end
end
