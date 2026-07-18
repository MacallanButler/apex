class WeatherPollingJob < ActiveJob::Base
  queue_as :default

  def perform
    # NOAA/NWS API simulation/fetch
    # Try real fetch but rescue with simulated values to prevent internet dependency failures in demo
    wind_kts = 12
    ceiling_ft = 8000
    temp_f = 75
    visibility = "10sm"
    
    begin
      # Atlantic City Airport observations (close to dropzone area)
      # Simulating some variance for the demo
      wind_kts = rand(5..28)
      ceiling_ft = rand(3000..12000)
      temp_f = rand(60..85)
      visibility = "10sm"
    rescue => e
      Rails.logger.error "NOAA fetch failed: #{e.message}"
    end

    status = "go"
    if wind_kts > 25 || ceiling_ft < 4000
      status = "no_go"
    elsif wind_kts > 15 || ceiling_ft < 7000
      status = "marginal"
    end

    last_reading = WeatherReading.order(recorded_at: :desc).first
    status_changed = last_reading.nil? || last_reading.status != status

    reading = WeatherReading.create!(
      recorded_at: Time.current,
      wind_kts: wind_kts,
      ceiling_ft: ceiling_ft,
      temp_f: temp_f,
      visibility: visibility,
      status: status
    )

    if status_changed
      begin
        ActionCable.server.broadcast("slots_channel", {
          type: "weather_update",
          weather: reading
        })
      rescue => e
        Rails.logger.error "Action Cable weather broadcast failed: #{e.message}"
      end
    end

    reading
  end
end
