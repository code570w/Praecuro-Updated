const NurseModel = require("../models/Nurse.model");

const getAllNurses = async (req, res) => {
  try {
    const allNurses = await NurseModel.find({});
    res.status(200).send(allNurses);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

module.exports = {
  getAllNurses,
};
