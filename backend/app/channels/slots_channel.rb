class SlotsChannel < ApplicationCable::Channel
  def subscribed
    stream_from "slots_channel"
  end

  def unsubscribed
  end
end
