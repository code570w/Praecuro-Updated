var auth = require("../controllers/Auth.controller");

module.exports = (app) => {
  app.post("/auth/registerUser", auth.register);
  app.post("/user/login", auth.login);
};
