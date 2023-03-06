var mongoose = require("mongoose");
const Admin = mongoose.model("Admin");
const jwt = require("jsonwebtoken");

const Nurse = mongoose.model("Nurse");
const Client = mongoose.model("Client");

exports.register = async (req, res) => {
  console.log("--- backend (register) ----");
  console.log(req.body);
  if (req.body.role == 2) {
    await Client.findOne({ email: req.body.email }).then((admin) => {
      if (admin) {
        return res.json({ success: false, errMessage: "Email already exists" });
      } else {
        let admin = new Admin(req.body);
        admin.setPassword(req.body.password);
        admin.save((err) => {
          if (err) {
            return res.json({
              success: false,
              errMessage:
                "Unknown errors occurred while new admin registering.",
            });
          } else {
            res.status(200).json({ success: true });
          }
        });
      }
    });
  } else {
    await Nurse.findOne({ email: req.body.email }).then((admin) => {
      if (admin) {
        return res.json({ success: false, errMessage: "Email already exists" });
      } else {
        let admin = new Nurse(req.body);
        admin.setPassword(req.body.password);
        admin.save((err) => {
          if (err) {
            return res.json({
              success: false,
              errMessage:
                "Unknown errors occurred while new admin registering.",
            });
          } else {
            res.status(200).json({ success: true });
          }
        });
      }
    });
  }
};

exports.login = async (req, res) => {
  console.log("--- backend (auth-login) ----");
  console.log(req.body);
  await Nurse.findOne({ email: req.body.email }).then((admin) => {
    if (!admin) {
      Client.findOne({ email: req.body.email }).then((user) => {
        if (!user) {
          return res.json({
            success: false,
            errMessage: "Email not found. Please confirm your email again!",
          });
        } else {
          let result = user.validatePassword(req.body.password);
          if (!result) {
            return res.json({
              success: false,
              errMessage:
                "Password is wrong. Please confirm your password again!",
            });
          } else {
            if (!user.accountActive) {
              return res.json({
                success: false,
                errMessage:
                  "You didn't confirm your email. Please confirm your email !",
              });
            } else {
              // let token = user.generateJwt();
              // res.json({success: true, role: 2, token: token, user: user});
              const payload = {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                type: "Client",
              };
              jwt.sign(
                payload,
                "jwt-default-secret",
                { expiresIn: 60 * 60 * 24 * 60 },
                (err, token) => {
                  if (err)
                    return res
                      .status(500)
                      .json({ token: "Error signing token." });
                  res
                    .status(200)
                    .json({ success: true, role: 2, token: token, user: user });
                }
              );
            }
          }
        }
      });
    } else {
      let result = admin.validatePassword(req.body.password);
      if (!result) {
        return res.json({
          success: false,
          errMessage: "Password is wrong. Please confirm your password again!",
        });
      } else {
        // let token = admin.generateJwt();
        // res.json({success: true, role: 3, token: token, user: admin});
        const payload = {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          type: "Nurse",
        };
        jwt.sign(
          payload,
          "jwt-default-secret",
          { expiresIn: 60 * 60 * 24 * 60 },
          (err, token) => {
            if (err)
              return res.status(500).json({ token: "Error signing token." });
            res
              .status(200)
              .json({ success: true, role: 3, token: token, user: user });
          }
        );
      }
    }
  });
};

exports.updateAdmin = async (req, res) => {
  res.send("UPDATE ADMIN");
  var jsonAdmin = JSON.parse(req.body.jsonAdmin);
  let adminObj = new Admin(jsonAdmin);
  adminObj.setPassword(jsonAdmin.password);
  Admin.findOneAndUpdate(
    {},
    {
      email: adminObj.email,
      password: adminObj.password,
      avatar: adminObj.avatar,
      incomeLedger: adminObj.incomeLedger,
      expensiveLedger: adminObj.expensiveLedger,
    },
    {
      new: true,
      useFindAndModify: false,
    },
    async function (err, admin) {
      if (err) {
        res.json({
          success: false,
          errMessage: "Unknown errors occurred while updating admin.",
        });
      } else {
        //Generate new activity
        let activityObj = { type: 3, key: "You" };
        let newActivity = new Activity(activityObj);
        newActivity.generateNewActivity();
        await newActivity.save();

        let activities = await Activity.find();
        return res.json({
          success: true,
          admin: admin,
          activities: activities,
        });
      }
    }
  );
};
