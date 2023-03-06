var mongoose = require("mongoose");
var CustomerSchema = new mongoose.Schema(
  {
    email: { type: String },
    // source:{ type: mongoose.Schema.Types.ObjectId, ref: 'Source'},
    source: { type: String },
    customer: { type: Object },
  },
  { toJSON: { getters: true }, timestamps: true }
);

module.exports = mongoose.model("Customer", CustomerSchema);
