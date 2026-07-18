class ManifestChannel < ApplicationCable::Channel
  def subscribed
    stream_from "manifest_channel"
  end

  def unsubscribed
  end
end
