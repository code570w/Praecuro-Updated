const {
  searchNurse,
  showHideNurseData,
} = require("../controllers/Client.controller");

module.exports = (app) => {
  app.get("/search-nurse", searchNurse);
  app.get("/client/:id/hide-nurse", showHideNurseData);
};
