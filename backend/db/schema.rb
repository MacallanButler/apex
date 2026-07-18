# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_07_17_100044) do
  create_table "bookings", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.integer "deposit_paid_cents"
    t.text "extras"
    t.string "guest_email"
    t.string "guest_name"
    t.string "guest_phone"
    t.integer "instructor_id"
    t.string "package", null: false
    t.string "status", default: "pending_payment", null: false
    t.string "stripe_payment_intent_id"
    t.integer "time_slot_id", null: false
    t.integer "total_cents", null: false
    t.datetime "updated_at", null: false
    t.integer "user_id"
    t.index ["time_slot_id"], name: "index_bookings_on_time_slot_id"
    t.index ["user_id"], name: "index_bookings_on_user_id"
  end

  create_table "jwt_denylist", force: :cascade do |t|
    t.datetime "exp", null: false
    t.string "jti", null: false
    t.index ["jti"], name: "index_jwt_denylist_on_jti"
  end

  create_table "time_slots", force: :cascade do |t|
    t.integer "capacity", null: false
    t.datetime "created_at", null: false
    t.date "date", null: false
    t.string "location", default: "Main Dropzone", null: false
    t.string "time", null: false
    t.datetime "updated_at", null: false
    t.index ["date", "time", "location"], name: "index_time_slots_on_date_and_time_and_location", unique: true
  end

  create_table "users", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "name"
    t.string "phone"
    t.datetime "remember_created_at"
    t.datetime "reset_password_sent_at"
    t.string "reset_password_token"
    t.string "role", default: "student", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  create_table "waiver_acknowledgments", force: :cascade do |t|
    t.boolean "age_confirmed", default: false, null: false
    t.boolean "alcohol_confirmed", default: false, null: false
    t.integer "booking_id", null: false
    t.datetime "created_at", null: false
    t.boolean "health_confirmed", default: false, null: false
    t.string "ip_address", null: false
    t.boolean "risk_acknowledged", default: false, null: false
    t.datetime "signed_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "weight_confirmed", default: false, null: false
    t.index ["booking_id"], name: "index_waiver_acknowledgments_on_booking_id"
  end

  create_table "weather_readings", force: :cascade do |t|
    t.integer "ceiling_ft", null: false
    t.datetime "created_at", null: false
    t.datetime "recorded_at", null: false
    t.string "status", null: false
    t.integer "temp_f", null: false
    t.datetime "updated_at", null: false
    t.string "visibility", null: false
    t.decimal "wind_kts", null: false
  end

  add_foreign_key "bookings", "time_slots"
  add_foreign_key "bookings", "users"
  add_foreign_key "bookings", "users", column: "instructor_id"
  add_foreign_key "waiver_acknowledgments", "bookings"
end
