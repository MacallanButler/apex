class WaiverAcknowledgment < ApplicationRecord
  belongs_to :booking

  validates :booking, :signed_at, :ip_address, presence: true
  validates :age_confirmed, :weight_confirmed, :health_confirmed, :alcohol_confirmed, :risk_acknowledged, acceptance: { accept: true, message: "must be confirmed" }
end
