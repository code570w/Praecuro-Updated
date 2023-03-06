var mongoose = require("mongoose");

var NurseCategorySchema = new mongoose.Schema(
  {
    id: { type: Number },
    name: { type: String },
    requiredContent: { type: String },
    description: { type: String },
  },
  { toJSON: { getters: true }, timestamps: true }
);

module.exports = mongoose.model("NurseCategory", NurseCategorySchema);
