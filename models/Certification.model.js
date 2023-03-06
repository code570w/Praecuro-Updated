var mongoose = require("mongoose");
var Config = require("../config/config");
var CertificationSchema = new mongoose.Schema(
  {
    id: { type: Number },
    nurseId: { type: mongoose.Schema.Types.ObjectId, ref: "Nurse" },
    name: { type: String },
    active: { type: String, default: "Pending" },
    avatar: { type: String },
    certificate_avatar: { type: String },
    createDate: { type: Date },
    date: { type: Date },
    date_expiry: { type: Date },
    modifyDate: { type: Date },
  },
  { toJSON: { getters: true }, timestamps: true }
);

module.exports = mongoose.model("Certification", CertificationSchema);
