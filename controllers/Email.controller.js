const { NurseEmail, EmployeeEmail } = require("../models/Email.model");

// NURSE EMAIL TEMPLATE
// GET EMAIL CONTENT
const nurseEmailContent = async (req, res) => {
  //   res.send("Get Email");
  try {
    const data = await NurseEmail.findOne().sort({ _id: -1 }).limit(1);
    res.status(200).send(data);
  } catch (error) {
    res.status(500).send("Failed to retrieve data");
  }
};

// SAVE POST CONTENT
const saveNurseEmailContent = async (req, res) => {
  //   res.send("Save Email");
  try {
    const data = new NurseEmail({
      content: req.body.content,
    });
    await data.save();
    res.status(201).send("Email Content Saved Successfully!");
  } catch (error) {
    res.status(400).send("Failed to save Data");
  }
};

// EMPLOYEE EMAIL TEMPLATE
// GET EMAIL CONTENT
const employeeEmailContent = async (req, res) => {
  //   res.send("Get Email");
  try {
    const data = await EmployeeEmail.findOne().sort({ _id: -1 }).limit(1);
    res.status(200).send(data);
  } catch (error) {
    res.status(500).send("Failed to retrieve data");
  }
};

// SAVE POST CONTENT
const saveEmployeeEmailContent = async (req, res) => {
  //   res.send("Save Email");
  try {
    const data = new EmployeeEmail({
      content: req.body.content,
    });
    await data.save();
    res.status(201).send("Email Content Saved Successfully!");
  } catch (error) {
    res.status(400).send("Failed to save Data");
  }
};

module.exports = {
  nurseEmailContent,
  saveNurseEmailContent,
  employeeEmailContent,
  saveEmployeeEmailContent,
};
