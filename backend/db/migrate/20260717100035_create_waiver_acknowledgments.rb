class CreateWaiverAcknowledgments < ActiveRecord::Migration[8.1]
  def change
    create_table :waiver_acknowledgments do |t|
      t.references :booking, null: false, foreign_key: true
      t.boolean :age_confirmed, null: false, default: false
      t.boolean :weight_confirmed, null: false, default: false
      t.boolean :health_confirmed, null: false, default: false
      t.boolean :alcohol_confirmed, null: false, default: false
      t.boolean :risk_acknowledged, null: false, default: false
      t.datetime :signed_at, null: false
      t.string :ip_address, null: false

      t.timestamps
    end
  end
end
