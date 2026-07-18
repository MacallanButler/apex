WaiverAcknowledgment.destroy_all
Booking.destroy_all
TimeSlot.destroy_all
User.destroy_all
WeatherReading.destroy_all

# 1. Create Users
admin = User.find_or_create_by!(email: "admin@apex.com") do |u|
  u.password = "password"
  u.role = "admin"
  u.name = "System Admin"
  u.phone = "555-0100"
end

instructor = User.find_or_create_by!(email: "instructor@apex.com") do |u|
  u.password = "password"
  u.role = "instructor"
  u.name = "Sarah Connor"
  u.phone = "555-0199"
end

student = User.find_or_create_by!(email: "student@apex.com") do |u|
  u.password = "password"
  u.role = "student"
  u.name = "Jane Doe"
  u.phone = "555-0188"
end

puts "Users seeded: Admin, Instructor, Student"

# 2. Create 30 Days of Time Slots
times = ["09:00 AM", "11:30 AM", "02:00 PM", "04:30 PM"]
today = Date.today
slots_created = 0

(0...30).each do |i|
  date = today + i.days
  next if date.monday? # Dropzone closed on Mondays

  times.each do |t|
    capacity = (date.saturday? || date.sunday?) ? 20 : 8
    TimeSlot.create!(
      date: date,
      time: t,
      capacity: capacity,
      location: "Main Dropzone"
    )
    slots_created += 1
  end
end

puts "#{slots_created} time slots created for the next 30 days."

# 3. Create Sample Bookings
# Booking 1
slot_1 = TimeSlot.find_by!(date: today, time: "09:00 AM")
b1 = Booking.create!(
  user: student,
  time_slot: slot_1,
  package: "tandem",
  instructor_id: instructor.id,
  extras: ["video", "photos"],
  total_cents: 42700,
  deposit_paid_cents: 12810,
  status: "scheduled"
)
WaiverAcknowledgment.create!(
  booking: b1,
  age_confirmed: true,
  weight_confirmed: true,
  health_confirmed: true,
  alcohol_confirmed: true,
  risk_acknowledged: true,
  signed_at: Time.current,
  ip_address: "127.0.0.1"
)

# Booking 2
slot_2 = TimeSlot.find_by!(date: today, time: "11:30 AM")
b2 = Booking.create!(
  guest_name: "Alex Rider",
  guest_email: "alex.rider@example.com",
  guest_phone: "555-0122",
  time_slot: slot_2,
  package: "solo",
  extras: ["insurance"],
  total_cents: 21800,
  deposit_paid_cents: 6540,
  status: "completed"
)
WaiverAcknowledgment.create!(
  booking: b2,
  age_confirmed: true,
  weight_confirmed: true,
  health_confirmed: true,
  alcohol_confirmed: true,
  risk_acknowledged: true,
  signed_at: Time.current,
  ip_address: "127.0.0.1"
)

# Booking 3 (Tomorrow)
slot_3 = TimeSlot.find_by!(date: today + 1.day, time: "02:00 PM")
b3 = Booking.create!(
  guest_name: "Charlie Brown",
  guest_email: "charlie.brown@example.com",
  guest_phone: "555-0133",
  time_slot: slot_3,
  package: "sunset",
  extras: ["video", "insurance"],
  total_cents: 42700,
  deposit_paid_cents: 12810,
  status: "scheduled"
)
WaiverAcknowledgment.create!(
  booking: b3,
  age_confirmed: true,
  weight_confirmed: true,
  health_confirmed: true,
  alcohol_confirmed: true,
  risk_acknowledged: true,
  signed_at: Time.current,
  ip_address: "127.0.0.1"
)

puts "3 sample bookings with waiver acknowledgments seeded successfully."

# 4. Create initial WeatherReading
WeatherReading.create!(
  recorded_at: Time.current,
  wind_kts: 10,
  ceiling_ft: 12000,
  temp_f: 78,
  visibility: "10sm",
  status: "go"
)
puts "Initial GO weather reading seeded."
