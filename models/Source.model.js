var mongoose = require("mongoose");
var SourceSchema = new mongoose.Schema(
  {
    email: { type: String },
    id: { type: String },
    object: { type: String },
    ach_credit_transfer: {
      account_number: { type: String },
      routing_number: { type: String },
      fingerprint: { type: String },
      swift_code: { type: String },
      bank_name: { type: String },
      refund_routing_number: { type: String },
      refund_account_holder_type: { type: String },
      refund_account_holder_name: { type: String },
    },
    created: { type: Number },
    amount: { type: String },
    client_secret: { type: String },
    currency: { type: String, default: "usd" },
    flow: { type: String },
    livemode: { type: Boolean },
    owner: {
      address: { type: String },
      email: { type: String },
      name: { type: String },
      phone: { type: String },
      verified_address: { type: String },
      verified_email: { type: String },
      verified_name: { type: String },
      verified_phone: { type: String },
    },
    receiver: {
      address: { type: String },
      amount_charged: { type: Number },
      amount_received: { type: Number },
      amount_returned: { type: Number },
      refund_attributes_method: { type: String },
      refund_attributes_status: { type: String },
    },
    statement_descriptor: { type: String },
    status: { type: String },
    type: { type: String },
    usage: { type: String },
  },
  { toJSON: { getters: true }, timestamps: true }
);

module.exports = mongoose.model("Source", SourceSchema);
