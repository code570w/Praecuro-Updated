const NurseModel = require("../models/Nurse.model");

// SEARCH NURSE
const searchNurse = async (req, res) => {
  try {
    const search = req.query.search;
    const nurses = await NurseModel.find({
      $or: [{ firstName: { $regex: `${search}`, $options: "i" } }],
    });
    res.status(200).send(nurses);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

const showHideNurseData = async (req, res) => {
  try {
    const clientId = req.params.id;
    const { nurseId, hidden } = req.body;
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).send({ message: "Client not found" });
    }
    const nurseIndex = client.hiddenNurses.findIndex(
      (nurse) => nurse.id === nurseId
    );
    if (nurseIndex === -1) {
      return res.status(404).send({ message: "Nurse not found" });
    }
    client.hiddenNurses[nurseIndex].hidden = hidden;
    await client.save();
    res.send({ message: "Nurse hidden status updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Server Error" });
  }
};

module.exports = {
  searchNurse,
  showHideNurseData,
};
