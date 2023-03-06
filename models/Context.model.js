var mongoose = require("mongoose");
var ContextSchema = new mongoose.Schema(
  {
    id: { type: Number },
    name: { type: String },
    email: { type: String },
    subject: { type: String },
    content: { type: String },
    createdDate: { type: Date },
  },
  { toJSON: { getters: true }, timestamps: true }
);

module.exports = mongoose.model("Context", ContextSchema);
