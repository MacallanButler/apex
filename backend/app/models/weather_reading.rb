class WeatherReading < ApplicationRecord
  enum :status, { go: "go", marginal: "marginal", no_go: "no_go" }

  validates :recorded_at, :wind_kts, :ceiling_ft, :temp_f, :visibility, :status, presence: true
end
