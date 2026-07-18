class CreateWeatherReadings < ActiveRecord::Migration[8.1]
  def change
    create_table :weather_readings do |t|
      t.datetime :recorded_at, null: false
      t.decimal :wind_kts, null: false
      t.integer :ceiling_ft, null: false
      t.integer :temp_f, null: false
      t.string :visibility, null: false
      t.string :status, null: false

      t.timestamps
    end
  end
end
