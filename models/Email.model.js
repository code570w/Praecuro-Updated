const mongoose = require("mongoose");

const nureseEmailSchema = new mongoose.Schema(
  {
    content: {
      type: "String",
      required: true,
    },
  },
  { timestamps: true }
);

const employeeEmailSchema = new mongoose.Schema(
  {
    content: {
      type: "String",
      required: true,
    },
  },
  { timestamps: true }
);

const NurseEmail = mongoose.model("NurseEmail", nureseEmailSchema);
const EmployeeEmail = mongoose.model("EmployeeEmail", employeeEmailSchema);

module.exports = {
  NurseEmail,
  EmployeeEmail,
};
