var mongoose = require("mongoose");
// var Config = require('../config/config');

var PercentageSchema = new mongoose.Schema(
  {
    id: { type: Number },
    percentage: { type: Number },
    modifyDate: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Percentage", PercentageSchema);
