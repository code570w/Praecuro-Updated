var mongoose = require("mongoose");

var LedgerSchema = new mongoose.Schema(
  {
    vendor: { type: String, default: "" },
    amount: { type: Number, default: 0 },
    memo: { type: String, default: "" },
    company: { type: String, default: "" },
    registeredTime: { type: Date, default: Date.now },
    status: { type: Number, default: 0 }, // 0: Income Ledger, 1: Expensive Ledger
  },
  { timestamps: true }
);

var Ledger = mongoose.model("Ledger", LedgerSchema);

module.exports = Ledger;
