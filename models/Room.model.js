var mongoose = require("mongoose");
var RoomSchema = new mongoose.Schema(
  {
    peopleClient: { type: mongoose.Schema.ObjectId, ref: "Client" },
    peopleNurse: { type: mongoose.Schema.ObjectId, ref: "Nurse" },
    lastUpdate: Date,
    lastClient: { type: mongoose.Schema.ObjectId, ref: "Client" },
    lastNurse: { type: mongoose.Schema.ObjectId, ref: "Nurse" },
    lastMessage: { type: mongoose.Schema.ObjectId, ref: "messages" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("rooms", RoomSchema);
