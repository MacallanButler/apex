class CreateTimeSlots < ActiveRecord::Migration[8.1]
  def change
    create_table :time_slots do |t|
      t.date :date, null: false
      t.string :time, null: false
      t.integer :capacity, null: false
      t.string :location, null: false, default: "Main Dropzone"

      t.timestamps
    end
    add_index :time_slots, [:date, :time, :location], unique: true
  end
end
