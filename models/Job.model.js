var mongoose = require("mongoose");
var JobSchema = new mongoose.Schema(
  {
    id: { type: Number },
    status: { type: String, default: "Pending" },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "NurseCategory" },
    client: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
    nurse: { type: mongoose.Schema.Types.ObjectId, ref: "Nurse" },
    startDate: { type: Date },
    modifyDate: { type: Date },
    budget: { type: Number },
    startTime: { type: String, default: "AM" },
    endTime: { type: String, default: "PM" },
    jbdate: { type: Date },
    budgetType: { type: String, default: "Flat" },
    deadline: { type: Number },
    location: { type: String },
    address: { type: String },
    rate: { type: Number },
    summary: { type: String },
    period: { type: Number },
    title: { type: String },
    count: { type: Number, default: 0 },
    review: { type: String, default: "" },
    zipCode: { type: String },
    state: { type: String },
    city: { type: String },
    salary_offer: { type: Number },
    peypay_amount: { type: Number, default: 0 },
    prepay_arr: { type: Object },
    paymentToken: { type: Object },
    customerSource: { type: Object },
    loc: {
      type: { type: String },
      coordinates: Array,
    },
  },
  { toJSON: { getters: true } }
);

JobSchema.index({ loc: "2dsphere" });
module.exports = mongoose.model("Job", JobSchema);
