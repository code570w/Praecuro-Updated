var mongoose = require("mongoose");

var ReviewSchema = new mongoose.Schema(
  {
    id: { type: Number },
    Responsiveness: { type: Number },
    Professionalism: { type: Number },
    Value: { type: Number },
    Flexibility: { type: Number },
    Behaviour: { type: Number },
    reviewSubject: { type: String },
    reviewWrite: { type: String },
    reviewOverallRating: { type: String },
    fromNurse: { type: mongoose.Schema.Types.ObjectId, ref: "Nurse" },
    fromClient: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
    toNurse: { type: mongoose.Schema.Types.ObjectId, ref: "Nurse" },
    toClient: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
    reviewDate: { type: Date },
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
  },
  { toJSON: { getters: true }, timestamps: true }
);

module.exports = mongoose.model("Review", ReviewSchema);
