var mongoose = require("mongoose");
var BankSchema = new mongoose.Schema(
  {
    id: { type: Number },
    client: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
    nurse: { type: mongoose.Schema.Types.ObjectId, ref: "Nurse" },
    startDate: { type: Date },
    modifyDate: { type: Date },
    country: { type: String, default: "US" },
    currency: { type: String, default: "usd" },
    routing_number: { type: String },
    account_number: { type: String },
    account_holder_name: { type: String },
    account_holder_type: { type: String },
    token: { type: String },
    count: { type: Number, default: 0 },
  },
  { toJSON: { getters: true }, timestamps: true }
);

module.exports = mongoose.model("Bank", BankSchema);
