class CreateBookings < ActiveRecord::Migration[8.1]
  def change
    create_table :bookings do |t|
      t.references :user, null: true, foreign_key: true
      t.string :guest_name
      t.string :guest_email
      t.string :guest_phone
      t.references :time_slot, null: false, foreign_key: true
      t.string :package, null: false
      t.integer :instructor_id
      t.text :extras
      t.integer :total_cents, null: false
      t.string :status, null: false, default: "pending_payment"
      t.string :stripe_payment_intent_id
      t.integer :deposit_paid_cents

      t.timestamps
    end
    add_foreign_key :bookings, :users, column: :instructor_id
  end
end
