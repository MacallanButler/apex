class Api::V1::WebhooksController < Api::V1::BaseController
  skip_before_action :authenticate_user!

  def stripe
    payload = request.body.read
    sig_header = request.env['HTTP_STRIPE_SIGNATURE']
    webhook_secret = ENV['STRIPE_WEBHOOK_SECRET']
    event = nil

    if webhook_secret.present? && sig_header.present?
      begin
        event = Stripe::Webhook.construct_event(
          payload, sig_header, webhook_secret
        )
      rescue Stripe::SignatureVerificationError => e
        render json: { error: "Signature verification failed: #{e.message}" }, status: :bad_request
        return
      rescue JSON::ParserError => e
        render json: { error: "Invalid payload" }, status: :bad_request
        return
      end
    else
      begin
        # Parse payload directly for mock webhook triggers
        parsed = JSON.parse(payload, symbolize_names: true)
        event = parsed
      rescue JSON::ParserError => e
        render json: { error: "Invalid JSON payload" }, status: :bad_request
        return
      end
    end

    event_type = event.is_a?(Hash) ? event[:type] : event.type
    event_data = event.is_a?(Hash) ? event[:data][:object] : event.data.object

    if event_type == 'payment_intent.succeeded'
      payment_intent_id = event_data[:id]
      success = StripeDepositService.confirm_payment(payment_intent_id)
      if success
        render json: { message: "Payment confirmed and booking scheduled." }, status: :ok
      else
        render json: { error: "No booking found matching payment intent: #{payment_intent_id}" }, status: :not_found
      end
    else
      render json: { message: "Received unhandled event type: #{event_type}" }, status: :ok
    end
  end
end
