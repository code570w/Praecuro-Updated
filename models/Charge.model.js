var mongoose = require("mongoose");

var ChargeSchema = new mongoose.Schema(
  {
    id: { type: Number },
    charge: { type: Object },
    adminPercentageAmount: { type: Object },
    client: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
    nurse: { type: mongoose.Schema.Types.ObjectId, ref: "Nurse" },
    createdDate: { type: Date },
    customer: { type: String },
    amount: { type: Number },
  },
  { toJSON: { getters: true }, timestamps: true }
);

module.exports = mongoose.model("Charge", ChargeSchema);
