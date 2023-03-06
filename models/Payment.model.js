var mongoose = require("mongoose");
var PaymentSchema = new mongoose.Schema(
  {
    id: { type: Number },
    client: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
    nurse: { type: mongoose.Schema.Types.ObjectId, ref: "Nurse" },
    createDate: { type: Date },
    amount: { type: Number },
    currency: { type: String, default: "usd" },
    customer: { type: String },
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
  },
  { toJSON: { getters: true }, timestamps: true }
);

module.exports = mongoose.model("Payment", PaymentSchema);
