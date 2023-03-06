var mongoose = require("mongoose");
var MessageSchema = new mongoose.Schema(
  {
    // author: {type: Schema.ObjectId, ref: 'users'},
    authorClient: { type: mongoose.Schema.ObjectId, ref: "Client" },
    authorNurse: { type: mongoose.Schema.ObjectId, ref: "Nurse" },
    content: String,
    type: String,
    room: { type: mongoose.Schema.ObjectId, ref: "rooms" },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("messages", MessageSchema);
