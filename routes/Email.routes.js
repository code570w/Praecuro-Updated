const {
  nurseEmailContent,
  saveNurseEmailContent,
  employeeEmailContent,
  saveEmployeeEmailContent,
} = require("../controllers/Email.controller");

module.exports = (app) => {
  app.get("/get-nurse-email-content", nurseEmailContent);
  app.post("/save-nurse-email-content", saveNurseEmailContent);
  app.get("/get-employee-email-content", employeeEmailContent);
  app.post("/save-employee-email-content", saveEmployeeEmailContent);
};
