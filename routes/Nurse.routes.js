const { getAllNurses } = require("../controllers/Nurse.controller");

module.exports = (app) => {
  app.get("/all/nurses", getAllNurses);
};
