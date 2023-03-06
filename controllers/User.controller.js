var mongoose = require("mongoose");
const User = mongoose.model("User");
const Nurse = mongoose.model("Nurse");
const Certification = mongoose.model("Certification");
const Client = mongoose.model("Client");
const Admin = mongoose.model("Admin");
const Activity = mongoose.model("Activity");
const EmailConfirmToken = mongoose.model("EmailVerification");
const VerifiyToken = mongoose.model("Verification");
const nodemailer = require("nodemailer");
const Charge = mongoose.model("Charge");
const Percentage = mongoose.model("Percentage");
const Context = mongoose.model("Context");
var Config = require("../config/config");
const { NurseEmail, EmployeeEmail } = require("../models/Email.model");
// const stripe = require('stripe')('sk_test_OJvo9v9hnM2EgTCcfzBh2skZ006DjFJIEw');
// const stripe = require('stripe')('sk_test_51HfIFdJlkFHXRZkLb0UNrZ2bjv9TFoFd4tGpYCjK8feEsx0IZASlcfmlXCAanKZwaniLtI64kJscdqZaTybXRHvI00KPxn1zOT');
const stripe = require("stripe")(
  "sk_test_51JpZHoESImW743YHZDXVzbv136Dq2OoWCsrmfIPkR5HaBoIIE3cG5wiW2ixnuUpzKwBgwPCXODgoXS64GAcCpTPS008PK5wUSy"
);

exports.register = async (req, res) => {
  let user = await User.findOne({ fullName: req.body.fullName });
  if (user) {
    return res.json({
      success: false,
      errMessage: "A user with this user name already exists.",
    });
  }

  user = await User.findOne({ email: req.body.email });
  if (user) {
    return res.json({
      success: false,
      errMessage: "A user with this email address already exists.",
    });
  }

  //Create new user and set password
  let newUser = new User(req.body);
  newUser.setPassword(req.body.password);

  var token = new EmailConfirmToken({
    email: req.body.email,
    token: crypto.randomBytes(16).toString("hex"),
  });

  var resetUrl = Config.clientUrl + "/confirm-email?token=" + token.token;

  token.save(function (err) {
    if (err) {
      return res.json({ success: false, errMessage: err.message });
    }
    var transporter = nodemailer.createTransport({
      // service: 'gmail'
      // secure: false,
      // port: 25,

      // host: 'smtp.gmail.com',
      // port: 587,
      // secure: false, // use SSL

      // port: 465,
      // ignoreTLS: false,
      // secure: true,

      host: "smtp.gmail.com",
      secureConnection: false,
      port: 587,
      requiresAuth: true,
      domains: ["gmail.com", "googlemail.com"],
      auth: {
        user: Config.email,
        pass: Config.password,
      },
      // tls: {
      //     // rejectUnauthorized: false
      //     rejectUnauthorized: true
      // }
    });
    var mailOptions = {
      from: "praecuroapp@gmail.com",
      to: req.body.email,
      subject: "Email Confirm Link",
      //You can use "html:" to send HTML email content. It's magic!
      html: `<h3>Hello ${req.body.fullName}</h3><br> <b>Please click on this link to continue filling out the application and submitting your documents.</b><br>${resetUrl}`,
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  });

  newUser.save(async (err) => {
    if (err) {
      return res.json({
        success: false,
        errMessage: "Unknown errors occurred while new user registering.",
      });
    } else {
      let token = newUser.generateJwt();
      res.json({ success: true, role: 1, token: token, user: newUser });
    }
  });
};

exports.registerUserAdmin = async (req, res) => {
  let user = await User.findOne({ fullName: req.body.fullName });
  if (user) {
    return res.json({
      success: false,
      errMessage: "A user with this user name already exists.",
    });
  }

  user = await User.findOne({ email: req.body.email });
  if (user) {
    return res.json({
      success: false,
      errMessage: "A user with this email address already exists.",
    });
  }

  //Create new user and set password
  let newUser = new User(req.body);
  newUser.setPassword(req.body.password);

  var token = new EmailConfirmToken({
    email: req.body.email,
    token: crypto.randomBytes(16).toString("hex"),
  });

  var resetUrl = Config.clientUrl + "/confirm-email?token=" + token.token;

  token.save(function (err) {
    if (err) {
      return res.json({ success: false, errMessage: err.message });
    }
    var transporter = nodemailer.createTransport({
      // service: 'gmail',
      // secure: false,
      // port: 25,

      // host: 'smtp.gmail.com',
      // port: 587,
      // secure: false, // use SSL

      // port: 465,
      // ignoreTLS: false,
      // secure: true,

      host: "smtp.gmail.com",
      secureConnection: false,
      port: 587,
      requiresAuth: true,
      domains: ["gmail.com", "googlemail.com"],
      auth: {
        user: Config.email,
        pass: Config.password,
      },
      // tls: {
      //     rejectUnauthorized: true
      // }
    });
    var mailOptions = {
      from: "apitestt26@gmail.com",
      to: req.body.email,
      subject: "Email Confirm Link",
      //You can use "html:" to send HTML email content. It's magic!
      html: `<h3>Hello ${req.body.fullName}</h3><br> <b>Please click on this link to continue filling out the application and submitting your documents.</b><br>${resetUrl}<p>Your Password: Lotus123</p>`,
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  });

  newUser.save(async (err) => {
    if (err) {
      return res.json({
        success: false,
        errMessage: "Unknown errors occurred while new user registering.",
      });
    } else {
      //Generate new activity
      let activityObj = { type: 0, key: newUser.fullName };
      let newActivity = new Activity(activityObj);
      newActivity.generateNewActivity();
      await newActivity.save();

      let users = await User.find();
      let activities = await Activity.find();
      return res.json({ success: true, users: users, activities: activities });
    }
  });
};

exports.addUser = async (req, res) => {
  let user = await User.findOne({ fullName: req.body.fullName });
  if (user) {
    return res.json({
      success: false,
      errMessage: "A user with this user name already exists.",
    });
  }

  user = await User.findOne({ email: req.body.email });
  if (user) {
    return res.json({
      success: false,
      errMessage: "A user with this email address already exists.",
    });
  }

  //Create new user and set password
  let newUser = new User(req.body);
  newUser.setPassword(req.body.password);

  newUser.save(async (err) => {
    if (err) {
      return res.json({
        success: false,
        errMessage: "Unknown errors occurred while new user registering.",
      });
    } else {
      //Generate new activity
      let activityObj = { type: 0, key: newUser.fullName };
      let newActivity = new Activity(activityObj);
      newActivity.generateNewActivity();
      await newActivity.save();

      let users = await User.find();
      let activities = await Activity.find();
      return res.json({ success: true, users: users, activities: activities });
    }
  });
};

exports.allUsers = async (req, res) => {
  User.find().exec(function (err, users) {
    if (err) {
      return res.json({
        success: false,
        errMessage: "Unknown errors occurred while getting all users.",
      });
    } else {
      return res.json({ success: true, users: users });
    }
  });
};

exports.updateUser = async (req, res) => {
  let userObj = new User(req.body);
  userObj.setPassword(req.body.password);

  User.findByIdAndUpdate(
    userObj._id,
    {
      fullName: userObj.fullName,
      address: userObj.address,
      phoneNumber: userObj.phoneNumber,
      email: userObj.email,
      password: userObj.password,
      companyName: userObj.companyName,
      fico: userObj.fico,
      bankName: userObj.bankName,
      accountNumber: userObj.accountNumber,
      routingNumber: userObj.routingNumber,
      zelle: userObj.zelle,
      driverLicense: {
        file: userObj.driverLicense.file,
        state: userObj.driverLicense.state,
      },
      social: {
        file: userObj.social.file,
        state: userObj.social.state,
      },
      passport: {
        file: userObj.passport.file,
        state: userObj.passport.state,
      },
      tax: {
        files: userObj.tax.files,
        state: userObj.tax.state,
      },
      statement: {
        files: userObj.statement.files,
        state: userObj.statement.state,
      },
      utility: {
        file: userObj.utility.file,
        state: userObj.utility.state,
      },
      phoneBill: {
        file: userObj.phoneBill.file,
        state: userObj.phoneBill.state,
      },
      additionalDoc: {
        files: userObj.additionalDoc.files,
        state: userObj.additionalDoc.state,
      },
      amountMonth: userObj.amountMonth,
      managementFee: userObj.managementFee,
      referer: userObj.referer,
      notes: userObj.notes,
      status: userObj.status,
    },
    {
      new: true,
      useFindAndModify: false,
    },
    async function (err, user) {
      if (err) {
        res.json({
          success: false,
          errMessage: "Unknown errors occurred while updating user.",
        });
      } else {
        //Generate new activity
        let activityObj = { type: 1, key: user.fullName };
        let newActivity = new Activity(activityObj);
        newActivity.generateNewActivity();
        await newActivity.save();

        let users = await User.find();
        let activities = await Activity.find();
        return res.json({
          success: true,
          users: users,
          activities: activities,
        });
      }
    }
  );
};

exports.updateRealUser = async (req, res) => {
  let userObj = new User(req.body);
  userObj.setPassword(req.body.password);
  User.findByIdAndUpdate(
    userObj._id,
    {
      fullName: userObj.fullName,
      address: userObj.address,
      phoneNumber: userObj.phoneNumber,
      email: userObj.email,
      password: userObj.password,
      companyName: userObj.companyName,
      fico: userObj.fico,
      bankName: userObj.bankName,
      accountNumber: userObj.accountNumber,
      routingNumber: userObj.routingNumber,
      zelle: userObj.zelle,
      driverLicense: {
        file: userObj.driverLicense.file,
        state: userObj.driverLicense.state,
      },
      social: {
        file: userObj.social.file,
        state: userObj.social.state,
      },
      passport: {
        file: userObj.passport.file,
        state: userObj.passport.state,
      },
      tax: {
        files: userObj.tax.files,
        state: userObj.tax.state,
      },
      statement: {
        files: userObj.statement.files,
        state: userObj.statement.state,
      },
      utility: {
        file: userObj.utility.file,
        state: userObj.utility.state,
      },
      phoneBill: {
        file: userObj.phoneBill.file,
        state: userObj.phoneBill.state,
      },
      additionalDoc: {
        files: userObj.additionalDoc.files,
        state: userObj.additionalDoc.state,
      },
      amountMonth: userObj.amountMonth,
      managementFee: userObj.managementFee,
      referer: userObj.referer,
      notes: userObj.notes,
    },
    {
      new: true,
      useFindAndModify: false,
    },
    async function (err, user) {
      if (err) {
        res.json({
          success: false,
          errMessage: "Unknown errors occurred while updating user.",
        });
      } else {
        return res.json({ success: true, user: user });
      }
    }
  );
};

exports.updateUserOneItem = (req, res) => {
  let userObj = req.body;
  User.findByIdAndUpdate(
    userObj._id,
    {
      [userObj.key]: userObj.value,
    },
    {
      new: true,
      useFindAndModify: false,
    },
    async function (err, user) {
      if (err) {
        res.json({
          success: false,
          errMessage: "Unknown errors occurred while updating user.",
        });
      } else {
        //Generate new activity
        let activityObj = { type: 1, key: user.fullName };
        let newActivity = new Activity(activityObj);
        newActivity.generateNewActivity();
        await newActivity.save();

        let users = await User.find();
        let activities = await Activity.find();
        return res.json({
          success: true,
          users: users,
          activities: activities,
        });
      }
    }
  );
};

exports.deleteUser = (req, res) => {
  var id = req.params.id;
  User.findByIdAndRemove(
    id,
    {
      new: true,
      useFindAndModify: false,
    },
    async function (err, user) {
      if (err) {
        res.json({
          success: false,
          errMessage: "Unknown errors occurred while deleting user.",
        });
      } else {
        //Generate new activity
        let activityObj = { type: 2, key: user.fullName };
        let newActivity = new Activity(activityObj);
        newActivity.generateNewActivity();
        await newActivity.save();

        let users = await User.find();
        let activities = await Activity.find();
        return res.json({
          success: true,
          users: users,
          activities: activities,
        });
      }
    }
  );
};

exports.confirmEmail = async (req, res) => {
  var token = req.body.token;
  EmailConfirmToken.findOne({
    token: token,
  })
    .then((verifyToken) => {
      if (verifyToken) {
        User.findOne({
          email: verifyToken.email,
        })
          .then((user) => {
            if (user) {
              var myquery = { email: user.email };
              var newvalues = { $set: { accountActive: true } };
              User.updateOne(myquery, newvalues)
                .then((us) => {
                  res.json({ success: true, data: user.email + " updated!" });
                })
                .catch((err) => {
                  res.json({ success: false, errMessage: "Wrong" });
                });
            } else {
              res.json({ success: false, errMessage: "User does not exist" });
            }
          })
          .catch((err) => {
            res.json({ success: false, errMessage: "User does not exist" });
          });
      } else {
        res.json({ success: false, errMessage: "User does not exist" });
      }
    })
    .catch((err) => {
      res.json({ success: false, errMessage: "User does not exist" });
    });
};

exports.forgotPassword = async (req, res) => {
  User.findOne({
    email: req.body.email,
  })
    .then((user) => {
      if (user) {
        var token = new VerifiyToken({
          _userId: user._id,
          token: crypto.randomBytes(16).toString("hex"),
        });

        var resetUrl =
          Config.clientUrl + `/password-reset?token=` + token.token;

        token.save(function (err) {
          if (err) {
            return res.json({ success: false, errMessage: err.message });
          }

          var transporter = nodemailer.createTransport({
            // service: 'gmail',
            // secure: false,
            // port: 25,

            // host: 'smtp.gmail.com',
            // port: 587,
            // secure: false, // use SSL

            // port: 465,
            // ignoreTLS: false,
            // secure: true,

            host: "smtp.gmail.com",
            secureConnection: false,
            port: 587,
            requiresAuth: true,
            domains: ["gmail.com", "googlemail.com"],
            auth: {
              user: Config.email,
              pass: Config.password,
            },
            // tls: {
            //     rejectUnauthorized: true
            // }
          });
          var mailOptions = {
            from: "apitestt26@gmail.com",
            to: req.body.email,
            subject: "Email Confirm Link",
            //You can use "html:" to send HTML email content. It's magic!
            html:
              "<h3>Hello!</h3><br> <b>To change your password, please visit the following url</b><br>" +
              resetUrl,
          };
          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.log(error);
            } else {
              console.log("Email sent: " + info.response);
            }
          });
          res.json({ success: true });
        });
      } else {
        res.json({ success: false, errMessage: "User does not exist" });
      }
    })
    .catch((err) => {
      res.json({ success: false, errMessage: err });
    });
};

exports.savePasswordWithVerify = async (req, res) => {
  var token = req.body.token;
  //console.log(decoced._id);
  VerifiyToken.findOne({
    token: token,
  })
    .then((verifyToken) => {
      if (verifyToken) {
        User.findOne({
          _id: verifyToken._userId,
        })
          .then((user) => {
            if (user) {
              if (req.body.newPass !== "") {
                // bcrypt.hash(req.body.newPass, 10, (err, hash) => {
                let tempUser = new User({});
                tempUser.setPassword(req.body.newPass);

                var myquery = { email: user.email };
                var newvalues = { $set: { password: tempUser.password } };
                User.updateOne(myquery, newvalues)
                  .then((us) => {
                    console.log(us);
                    res.json({
                      success: true,
                      status: user.email + " updated!",
                    });
                  })
                  .catch((err) => {
                    res.json({ successs: false, errMessage: "Wrong password" });
                  });
                // })
              } else {
                res.json({ success: false, errMessage: "Enpty passowrd" });
              }
            } else {
              res.json({ success: false, errMessage: "User does not exist" });
            }
          })
          .catch((err) => {
            res.json({ success: false, errMessage: "User does not exist" });
          });
      } else {
        res.json({ success: false, errMessage: "User does not exist" });
      }
    })
    .catch((err) => {
      res.json({ success: false, errMessage: "User does not exist" });
    });
};

// Nurse Management
exports.addNurse = async (req, res) => {
  console.log("--- AddNurse - Backend ---");
  console.log("req.body_____", req.body);
  Nurse.findOne({ email: req.body.email }).then((cate) => {
    if (cate) {
      res.json({ success: false, errMessage: "Already used same email" });
    } else {
      // Gettting nurse data from request and push to Nurse model instance
      let newNurse = new Nurse(req.body);

      newNurse.setPassword(req.body.password);
      // newNurse.client = req.client._id;
      newNurse.createDate = new Date();
      newNurse.modifyDate = new Date();
      // console.log("1");
      // console.log(newNurse);
      newNurse.save(async (err) => {
        if (err) {
          // console.log('2')
          // console.log(err)
          return res.json({ success: false, errMessage: "Unknown errors" });
        } else {
          const nurseEmailContent = await NurseEmail.findOne()
            .sort({ _id: -1 })
            .limit(1);
          // console.log("NURSE EMAIL CONTENT", nurseEmailContent.content);

          //   -----------------------------------------------
          var transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            secureConnection: false,
            port: 587,
            requiresAuth: true,
            domains: ["gmail.com", "googlemail.com"],
            auth: {
              user: Config.email,
              pass: Config.password,
            },
          });

          var mailOptions = {
            from: "praecuroapp@gmail.com",
            to: req.body.email,
            subject: "Register success",
            //You can use "html:" to send HTML email content. It's magic!
            // html: `<h3>Hello ${req.body.firstName} ${req.body.lastName}</h3><br> <b>Nurses Register successfully</b><br>`,
            html: `${nurseEmailContent.content}`,
          };
          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.log(error);
            } else {
              console.log("Email sent: " + info.response);
            }
          });

          // --------------------------------------------------

          console.log("3");
          let ledgers = await Nurse.find()
            .populate(["category", "client"])
            .sort({ modifyDate: 1 });
          console.log("---LEDGERS---", ledgers);
          res.status(200).json({ success: true, nurses: ledgers });
        }
      });
    }
  });
};

exports.updateNurse = (req, res) => {
  console.log("-backend update Nurse -");
  console.log(req.body);
  Nurse.findOne({ _id: req.body._id }).then((cate) => {
    if (!cate) {
      res.json({ success: false, errMessage: "Don't exist this Nurse" });
    } else {
      var tempPass;
      if (!req.body.password) tempPass = cate.password;
      Object.assign(cate, req.body);
      if (req.body.password) cate.setPassword(req.body.password);
      if (!req.body.password) cate.password = tempPass;
      cate.modifyDate = new Date();
      cate.save(async (err) => {
        if (err) {
          return res.json({ success: false, errMessage: "Unknown errors" });
        } else {
          let ledgers = await Nurse.find()
            .populate(["category"])
            .sort({ modifyDate: 1 });
          res
            .status(200)
            .json({ success: true, nurses: ledgers, curuser: cate });
        }
      });
    }
  });
};

exports.updateActive = (req, res) => {
  console.log("-backend update Nurse  Active -");
  console.log(req.body);
  Nurse.findOne({ _id: req.body.id }).then((cate) => {
    if (!cate) {
      res.json({ success: false, errMessage: "Don't exist this Nurse" });
    } else {
      if (cate.active == "Pending") cate.active = "Active";
      else cate.active = "Pending";
      cate.modifyDate = new Date();
      cate.save(async (err) => {
        if (err) {
          return res.json({ success: false, errMessage: "Unknown errors" });
        } else {
          let ledgers = await Nurse.find()
            .populate(["category"])
            .sort({ modifyDate: 1 });
          res
            .status(200)
            .json({ success: true, nurses: ledgers, curuser: cate });
        }
      });
    }
  });
};

exports.deleteNurse = (req, res) => {
  console.log("-delete Nurse-");
  console.log(req.body.id);
  var id = req.body.id;
  Nurse.findByIdAndRemove(
    id,
    {
      new: true,
      useFindAndModify: false,
    },
    async function (err, ledger) {
      if (err) {
        res.json({
          success: false,
          errMessage: "Unknown errors occurred while deleting Nurses.",
        });
      } else {
        let ledgers = await Nurse.find()
          .populate(["category"])
          .sort({ modifyDate: 1 });
        return res.json({ success: true, nurses: ledgers });
      }
    }
  );
};

exports.deletesNurse = (req, res) => {
  console.log("-deletes Nurse-");
  var arrId = req.body.str;
  console.log(req.body.str);
  arrId.forEach(async (element, index) => {
    await Nurse.findByIdAndRemove(
      element,
      {
        new: true,
        useFindAndModify: false,
      },
      async function (err, ledger) {
        if (err) {
          return res.json({
            success: false,
            errMessage: "Unknown errors occurred while deleting Nurses.",
          });
        } else {
          if (arrId.length == index + 1) {
            let ledgers = await Nurse.find()
              .populate(["category"])
              .sort({ modifyDate: 1 });
            return res.json({ success: true, nurses: ledgers });
          }
        }
      }
    );
  });
};

exports.permissionNurses = (req, res) => {
  console.log(req.body.str._ids);
  console.log(req.body.str.values);
  Nurse.findOne({ _id: req.body.str._ids }).then((data) => {
    if (!data) {
      res.json({ success: false, errMessage: "Don't exist this Nurse" });
    } else {
      Nurse.updateOne(
        { _id: req.body.str._ids },
        { permission: req.body.str.values },
        function (err, result) {
          if (err) {
            return res.json({ success: false, errMessage: "Unknown errors" });
          } else {
            res.status(200).json({ success: true, errMessage: "Success" });
          }
        }
      );
    }
  });
};

exports.getAllNurse = async (req, res) => {
  await Nurse.find()
    .populate(["category"])
    .sort({ reviewRating: 1 })
    .exec(function (err, users) {
      if (err) {
        return res.json({
          success: false,
          errMessage: "Unknown errors occurred while getting all Nurses.",
        });
      } else {
        console.log("users...", users);
        return res.json({ success: true, nurses: users });
      }
    });
};

// exports.getAllNurse = async (req, res) =>  {
//     await Nurse.find().populate(['category']).sort({ 'reviewRating': 1 })
//         .exec(function(err, users) {
//         if (err) {
//             return res.json({success: false, errMessage: "Unknown errors occurred while getting all Nurses."});
//         } else {

//             console.log('users...',users);
//             return res.json({success: true, nurses: users});
//         }
//     });

// };

// Client Management
exports.addClient = (req, res) => {
  console.log("--- AddClient - Backend ---");

  console.log(req.body);
  Client.findOne({ email: req.body.email }).then((cate) => {
    if (cate) {
      res.json({ success: false, errMessage: "Already used same email" });
    } else {
      let newNurse = new Client(req.body);

      // console.log('subbbb',newNurse);
      newNurse.setPassword(req.body.password);
      newNurse.createDate = new Date();
      newNurse.modifyDate = new Date();
      newNurse.role = 1;
      newNurse.save(async (err) => {
        if (err) {
          return res.json({ success: false, errMessage: "Unknown errors" });
        } else {
          // console.log(req.body);

          const employeeEmailContent = await EmployeeEmail.findOne()
            .sort({ _id: -1 })
            .limit(1);
          // console.log("EMPLOYEE EMAIL CONTENT", employeeEmailContent.content);

          //  -------------------------------------------

          var transporter = nodemailer.createTransport({
            // service: 'gmail',
            // secure: false,
            // port: 25,

            // host: 'smtp.gmail.com',
            // port: 587,
            // secure: false, // use SSL

            // port: 465,
            // ignoreTLS: false,
            // secure: true,

            host: "smtp.gmail.com",
            secureConnection: false,
            port: 587,
            requiresAuth: true,
            domains: ["gmail.com", "googlemail.com"],
            auth: {
              user: Config.email,
              pass: Config.password,
            },
            // tls: {
            //     rejectUnauthorized: true
            // }
          });
          var mailOptions = {
            from: "praecuroapp@gmail.com",
            to: req.body.email,
            subject: "Register success",
            //You can use "html:" to send HTML email content. It's magic!
            html: `${employeeEmailContent.content}`,
          };
          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              // console.log('rrrrrrrrr');
              console.log(error);
            } else {
              console.log("Email sent: " + info.response);
            }
          });

          // --------------------------------------------------

          let ledgers = await Client.find().sort({ modifyDate: 1 });
          res.status(200).json({ success: true, clients: ledgers });
        }
      });
    }
  });
};
exports.updateClient = (req, res) => {
  console.log("-backend update category -");
  console.log(req.body);
  Client.findOne({ _id: req.body._id }).then((cate) => {
    if (!cate) {
      res.json({ success: false, errMessage: "Don't exist this Client" });
    } else {
      var tempPass;
      if (!req.body.password) tempPass = cate.password;
      Object.assign(cate, req.body);
      if (req.body.password) cate.setPassword(req.body.password);
      if (!req.body.password) cate.password = tempPass;
      cate.modifyDate = new Date();
      cate.save(async (err) => {
        if (err) {
          return res.json({ success: false, errMessage: "Unknown errors" });
        } else {
          let ledgers = await Client.find().sort({ modifyDate: 1 });
          res
            .status(200)
            .json({ success: true, clients: ledgers, curuser: cate });
        }
      });
    }
  });
};

exports.deleteClient = (req, res) => {
  console.log("-delete Client-");
  console.log(req.body.id);
  var id = req.body.id;
  Client.findByIdAndRemove(
    id,
    {
      new: true,
      useFindAndModify: false,
    },
    async function (err, ledger) {
      if (err) {
        res.json({
          success: false,
          errMessage: "Unknown errors occurred while deleting Client.",
        });
      } else {
        let ledgers = await Client.find().sort({ modifyDate: 1 });
        return res.json({ success: true, clients: ledgers });
      }
    }
  );
};
exports.deletesClient = (req, res) => {
  console.log("-deletes Client-");
  var arrId = req.body.str;
  console.log(req.body.str);
  arrId.forEach(async (element, index) => {
    await Client.findByIdAndRemove(
      element,
      {
        new: true,
        useFindAndModify: false,
      },
      async function (err, ledger) {
        if (err) {
          return res.json({
            success: false,
            errMessage: "Unknown errors occurred while deleting Clients.",
          });
        } else {
          if (arrId.length == index + 1) {
            let ledgers = await Client.find().sort({ modifyDate: 1 });
            return res.json({ success: true, clients: ledgers });
          }
        }
      }
    );
  });
};
exports.getAllClient = async (req, res) => {
  await Client.find().exec(function (err, users) {
    if (err) {
      return res.json({
        success: false,
        errMessage: "Unknown errors occurred while getting all Clients.",
      });
    } else {
      return res.json({ success: true, clients: users });
    }
  });
};

exports.updateClientActive = (req, res) => {
  console.log("-backend update Active -");
  console.log(req.body);
  Client.findOne({ _id: req.body.id }).then((cate) => {
    if (!cate) {
      res.json({ success: false, errMessage: "Don't exist this Client" });
    } else {
      if (cate.active == "Pending") cate.active = "Active";
      else cate.active = "Pending";
      cate.modifyDate = new Date();
      cate.save(async (err) => {
        if (err) {
          return res.json({ success: false, errMessage: "Unknown errors" });
        } else {
          let ledgers = await Client.find().sort({ modifyDate: 1 });
          res
            .status(200)
            .json({ success: true, clients: ledgers, curuser: cate });
        }
      });
    }
  });
};

exports.updateClientHide = (req, res) => {
  console.log("-backend update Hide -");
  console.log(req.body);
  Client.findOne({ _id: req.body.id }).then((cate) => {
    if (!cate) {
      res.json({ success: false, errMessage: "Don't exist this Client" });
    } else {
      if (cate.hide == "Hide") cate.hide = "Show";
      else cate.hide = "Hide";
      cate.modifyDate = new Date();
      cate.save(async (err) => {
        if (err) {
          return res.json({ success: false, errMessage: "Unknown errors" });
        } else {
          let ledgers = await Client.find().sort({ modifyDate: 1 });
          res
            .status(200)
            .json({ success: true, clients: ledgers, curuser: cate });
        }
      });
    }
  });
};

exports.paymentInfo = async (req, res) => {
  console.log("--- paymentinfo -- ");
  // if(req.body.flag == 0){
  const token = await stripe.tokens.create({
    bank_account: {
      country: req.body.country,
      currency: req.body.currency,
      account_holder_name: req.body.accountHolderName,
      account_holder_type: req.body.accountHolderType,
      routing_number: req.body.routingNumber,
      account_number: req.body.accountNumber,
    },
  });

  const customer = await stripe.customers.create({
    email: req.body.email,
    source: token.id,
  });
  // console.log(customer)

  // }

  // console.log('token', token);

  // console.log('req.body.',req.body.flag);
  // console.log('-createcustomer-');

  //     Customer.findOne({email:req.body.email}).then((cate) => {
  //         if(cate){
  //         return res.json({success: false, errMessage: "Already Exist"});
  //         }else{
  //         let newNurse = new Customer({
  //             source:req.body.source,
  //             customer:customer,
  //             email:req.body.email
  //         });
  //         newNurse.save(async(err) => {
  //             if (err) {
  //                 console.log('err',err)
  //                 return res.json({success: false, errMessage: "Unknown errors"});
  //             } else {
  //                 res.status(200).json({success:true,customer:newNurse});
  //             }
  //         });
  //         }
  // })
  if (req.body.role == 1) {
    Client.findOne({ _id: req.body._id }).then((cate) => {
      if (!cate) {
        res.json({ success: false, errMessage: "Don't exist this Client" });
      } else {
        Object.assign(cate, req.body);
        if (req.body.flag == 0) {
          Object.assign(cate, { paymentToken: token });
          Object.assign(cate, { customerSource: customer });
        }
        cate.modifyDate = new Date();
        cate.save(async (err) => {
          if (err) {
            console.log("err-client", err);
            return res.json({ success: false, errMessage: "Unknown errors" });
          } else {
            let ledgers = await Client.find().sort({ modifyDate: 1 });
            res
              .status(200)
              .json({ success: true, users: ledgers, curuser: cate });
          }
        });
      }
    });
  } else {
    // console.log('hiiiiooo');

    Nurse.findOne({ _id: req.body._id }).then((cate) => {
      if (!cate) {
        res.json({ success: false, errMessage: "Don't exist this Client" });
      } else {
        Object.assign(cate, req.body);
        // Object.assign(cate, {paymentToken:JSON.stringify(token)})
        if (req.body.flag == 0) {
          Object.assign(cate, { paymentToken: token });
          Object.assign(cate, { customerSource: customer });
        }

        // console.log('catr fsys',cate);
        cate.modifyDate = new Date();
        cate.save(async (err) => {
          if (err) {
            console.log("err-nurse", err);
            return res.json({ success: false, errMessage: "Unknown errors" });
          } else {
            let ledgers = await Nurse.find().sort({ modifyDate: 1 });
            res
              .status(200)
              .json({ success: true, users: ledgers, curuser: cate });
          }
        });
      }
    });
  }
};

exports.adminpaymentInfo = async (req, res) => {
  console.log("---admin paymentinfo -- ");
  // if(req.body.flag == 0){
  const token = await stripe.tokens.create({
    bank_account: {
      country: req.body.country,
      currency: req.body.currency,
      account_holder_name: req.body.accountHolderName,
      account_holder_type: req.body.accountHolderType,
      routing_number: req.body.routingNumber,
      account_number: req.body.accountNumber,
    },
  });

  const customer = await stripe.customers.create({
    email: req.body.email,
    source: token.id,
  });

  Admin.findOne({ _id: req.body._id }).then((cate) => {
    if (!cate) {
      res.json({ success: false, errMessage: "Don't exist this Client" });
    } else {
      Object.assign(cate, req.body);
      if (req.body.flag == 0) {
        Object.assign(cate, { paymentToken: token });
        Object.assign(cate, { customerSource: customer });
      }
      cate.modifyDate = new Date();
      cate.save(async (err) => {
        if (err) {
          console.log("err-client", err);
          return res.json({ success: false, errMessage: "Unknown errors" });
        } else {
          let ledgers = await Admin.find().sort({ modifyDate: 1 });
          res
            .status(200)
            .json({ success: true, users: ledgers, curuser: cate });
        }
      });
    }
  });
};

exports.paymentverify = async (req, res) => {
  //
  const bankAccount = await stripe.customers.verifySource(
    req.body.customer,
    req.body.bank,
    {
      amounts: [32, 45],
    }
  );

  // console.log(json(bankAccount));
  if (bankAccount) {
    if (req.body.role == 1) {
      Client.findOne({ _id: req.body._id }).then((cate) => {
        if (!cate) {
          res.json({ success: false, errMessage: "Don't exist this Client" });
        } else {
          cate.paymentVerify = true;
          cate.modifyDate = new Date();
          cate.save(async (err) => {
            if (err) {
              console.log("err-client", err);
              return res.json({ success: false, errMessage: "Unknown errors" });
            } else {
              let ledgers = await Client.find().sort({ modifyDate: 1 });
              res
                .status(200)
                .json({ success: true, users: ledgers, curuser: cate });
            }
          });
        }
      });
    } else {
      Nurse.findOne({ _id: req.body._id }).then((cate) => {
        if (!cate) {
          res.json({ success: false, errMessage: "Don't exist this Client" });
        } else {
          cate.paymentVerify = true;
          cate.modifyDate = new Date();
          cate.save(async (err) => {
            if (err) {
              console.log("err-nurse", err);
              return res.json({ success: false, errMessage: "Unknown errors" });
            } else {
              let ledgers = await Nurse.find().sort({ modifyDate: 1 });
              res
                .status(200)
                .json({ success: true, users: ledgers, curuser: cate });
            }
          });
        }
      });
    }
  }
  // console.log('bankAccount', bankAccount)
};

exports.adminpaymentverify = async (req, res) => {
  // console.log('---verift accc----',req.body.bank);
  const bankAccount = await stripe.customers.verifySource(
    req.body.customer,
    req.body.bank,
    {
      amounts: [32, 45],
    }
  );

  // console.log(json(bankAccount));
  if (bankAccount) {
    Admin.findOne({ _id: req.body._id }).then((cate) => {
      if (!cate) {
        res.json({ success: false, errMessage: "Don't exist this Client" });
      } else {
        cate.paymentVerify = true;
        cate.modifyDate = new Date();
        cate.save(async (err) => {
          if (err) {
            console.log("err-client", err);
            return res.json({ success: false, errMessage: "Unknown errors" });
          } else {
            let ledgers = await Admin.find().sort({ modifyDate: 1 });
            res
              .status(200)
              .json({ success: true, users: ledgers, curuser: cate });
          }
        });
      }
    });
  }
  // console.log('bankAccount', bankAccount)
};

exports.paymentCharge = async (req, res) => {
  // console.log('req.body',req.body.to.customerSource.id);
  // process.exit();

  // const chargeUpdate = await stripe.charges.update(
  //     'py_1Juw1aESImW743YHycqD24DF',
  //     {metadata: {order_id: '6735'}}
  //   );

  //   console.log('chargeUpdate',chargeUpdate);

  //   process.exit();

  const get_admin_details = await Admin.find();
  // console.log('get_admin_details',get_admin_details[0]);
  const persentage = await Percentage.find();

  let nurses_amount = req.body.amount;
  if (get_admin_details[0].customerSource != undefined) {
    if (persentage[0].percentage != 0) {
      let get_pers_value = (req.body.amount * persentage[0].percentage) / 100;
      nurses_amount = req.body.amount - get_pers_value;
    }
  }

  //  console.log('get_admin_details',nurses_amount);s
  //  console.log('persentage',req.body.customer);
  //  process.exit();
  // req.body.customer
  const charge = await stripe.charges.create({
    amount: nurses_amount * 100,
    currency: "usd",
    customer: req.body.to.customerSource.id,
  });

  let send_commission = {};
  if (get_admin_details[0].customerSource != undefined) {
    if (persentage[0].percentage != 0) {
      var amou = ((req.body.amount * persentage[0].percentage) / 100) * 100;
      send_commission = await stripe.charges.create({
        amount: amou,
        currency: "usd",
        customer: get_admin_details[0].customerSource.id,
      });

      var calc = amou / 100;
      var getwallate = await Admin.find();
      var amounts = 0;
      if (getwallate[0].wallet_amount != undefined) {
        amounts = getwallate[0].wallet_amount;
      }
      //    console.log('getwallate',getwallate[0].wallet_amount);
      var postData = { wallet_amount: Number(amounts) + Number(calc) };
      var where = { _id: getwallate[0]._id };
      var modified = { $set: postData };
      Admin.updateOne(where, modified)
        .then((us) => {
          console.log("updated");
          // res.json({  success: true, data: user.email + ' updated!' })
        })
        .catch((err) => {
          console.log("Wrong");
          // res.json({ success: false, errMessage: "Wrong" })
        });
    }
  }

  // console.log('send_commission',send_commission);
  Charge.findOne({}).then((cate) => {
    let newNurse = new Charge({
      charge: charge,
      adminPercentageAmount: send_commission,
      customer: req.body.customer,
      amount: req.body.amount * 100,
      client: req.body.user._id,
      nurse: req.body.to._id,
    });
    newNurse.createdDate = new Date();
    newNurse.save(async (err) => {
      if (err) {
        return res.json({ success: false, errMessage: "Unknown errors" });
      } else {
        let ledgers = await Charge.find()
          .populate(["client", "nurse"])
          .sort({ createdDate: 1 });
        res.status(200).json({ success: true, charges: ledgers });
      }
    });
  });
};

//      exports.paymentCharge = async(req, res) =>{
//     const charge = await stripe.charges.create({
//     amount: req.body.amount * 100,
//     currency: 'usd',
//     customer: req.body.customer,
//     });

//     Charge.findOne({}).then((cate) => {
//         let newNurse = new Charge({
//             charge:charge,
//             customer:req.body.customer,
//             amount:req.body.amount  * 100,
//             client:req.body.user._id,
//             nurse:req.body.to._id
//         });
//         newNurse.createdDate = new Date();
//         newNurse.save(async(err) => {
//             if (err) {
//         return res.json({success: false, errMessage: "Unknown errors"});
//             } else {
//         let ledgers = await Charge.find().populate(['client','nurse']).sort({ 'createdDate': 1 });
//                 res.status(200).json({success:true, charges: ledgers});
//             }
//         });
// })
// }

exports.paymentgetcharge = async (req, res) => {
  let ledgers = await Charge.find()
    .populate(["client", "nurse"])
    .sort({ createdDate: 1 });
  res.status(200).json({ success: true, charges: ledgers });
};

exports.sendContext = async (req, res) => {
  console.log("send context");
  console.log(req.body);
  var transporter = nodemailer.createTransport({
    // service: 'gmail',
    // secure: false,
    // port: 25,
    // host: 'smtp.gmail.com',
    // port: 587,
    // secure: false, // use SSL

    // port: 465,
    // ignoreTLS: false,
    // secure: true,

    // host: "smtp.gmail.com",
    // secureConnection: false,
    // port: 587,
    // requiresAuth: true,
    // domains: ["gmail.com", "googlemail.com"],
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // upgrade later with STARTTLS

    auth: {
      user: Config.email,
      pass: Config.password,
    },
    // tls: {
    //     rejectUnauthorized: true
    // }
  });
  var mailOptions = {
    from: req.body.email,
    to: "praecuroapp@gmail.com",
    subject: req.body.subject,
    //You can use "html:" to send HTML email content. It's magic!
    html: req.body.content,
  };
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log("erro", error);
      return res.json({ success: false, errMessage: error });
    } else {
      let newContext = new Context(req.body);
      newContext.createdDate = new Date();
      newContext.save(async (err) => {
        if (err) {
          console.log(err);
          return res.json({
            success: false,
            errMessage: "Unknown errors occurred while new user registering.",
          });
        } else {
          return res.json({ success: true });
        }
      });
    }
  });
};

exports.getNewPassword = async (req, res) => {
  console.log("-- getnewpassword --");
  // console.log(req.body)
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < 10; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  var transporter = nodemailer.createTransport({
    // host: 'smtp.gmail.com',

    // service: 'gmail',
    // secure: false,
    // port: 25,

    // port: 587,
    // ignoreTLS: false,
    // secure: false,

    // port: 465,
    // secure: true,

    host: "smtp.gmail.com",
    secureConnection: false,
    port: 587,
    requiresAuth: true,
    domains: ["gmail.com", "googlemail.com"],
    auth: {
      user: Config.email,
      pass: Config.password,
    },
    tls: {
      rejectUnauthorized: true,
    },
  });
  var mailOptions = {
    from: "praecuroapp@gmail.com",
    to: req.body.email,
    subject: "Changed New Password (Nurse)",
    //You can use "html:" to send HTML email content. It's magic!
    html: "New Password: " + result,
  };
  console.log("ssrddd", Config.email, Config.password);
  Nurse.findOne({ email: req.body.email }).then((cate) => {
    if (!cate) {
      Client.findOne({ email: req.body.email }).then((cate1) => {
        if (!cate1) {
          res.json({ success: false, errMessage: "Don't exist this user" });
        } else {
          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.log("erro", error);
              return res.json({ success: false, errMessage: error });
            } else {
              cate1.setPassword(result);
              cate1.modifyDate = new Date();
              cate1.save(async (err) => {
                if (err) {
                  return res.json({
                    success: false,
                    errMessage: "Unknown errors",
                  });
                } else {
                  // let ledgers = await Nurse.find().populate(['category']).sort({ 'modifyDate': 1 });
                  res.status(200).json({ success: true });
                }
              });
            }
          });
        }
      });
    } else {
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log("erro", error);
          return res.json({ success: false, errMessage: error });
        } else {
          cate.setPassword(result);
          cate.modifyDate = new Date();
          cate.save(async (err) => {
            if (err) {
              return res.json({ success: false, errMessage: "Unknown errors" });
            } else {
              // let ledgers = await Nurse.find().populate(['category']).sort({ 'modifyDate': 1 });
              res.status(200).json({ success: true });
            }
          });
        }
      });
    }
  });
};

// Certification Management
exports.addCertification = (req, res) => {
  console.log("--- AddCertification - Backend ---");
  console.log(req.body);

  console.log("req.body", req.body);
  Certification.findOne({}).then((cate) => {
    let newNurse = new Certification(req.body);
    newNurse.createDate = new Date();
    newNurse.modifyDate = new Date();
    newNurse.save(async (err) => {
      if (err) {
        return res.json({ success: false, errMessage: "Unknown errors" });
      } else {
        console.log("3");
        let ledgers = await Certification.find()
          .populate(["nurseId"])
          .sort({ modifyDate: 1 });
        res.status(200).json({ success: true, certifications: ledgers });
      }
    });
  });
};
exports.updateCertification = (req, res) => {
  console.log("-backend update Certification -");
  console.log(req.body);
  Certification.findOne({ _id: req.body._id }).then((cate) => {
    if (!cate) {
      res.json({
        success: false,
        errMessage: "Don't exist this Certification",
      });
    } else {
      Object.assign(cate, req.body);
      cate.modifyDate = new Date();
      cate.save(async (err) => {
        if (err) {
          return res.json({ success: false, errMessage: "Unknown errors" });
        } else {
          let ledgers = await Certification.find()
            .populate(["nurseId"])
            .sort({ modifyDate: 1 });
          res.status(200).json({
            success: true,
            certifications: ledgers,
            curcertification: cate,
          });
        }
      });
    }
  });
};
exports.updateActiveCertification = (req, res) => {
  console.log("-backend update Certification  Active -");
  console.log(req.body);
  Certification.findOne({ _id: req.body._id }).then((cate) => {
    if (!cate) {
      res.json({
        success: false,
        errMessage: "Don't exist this Certification",
      });
    } else {
      if (cate.active == "Pending") cate.active = "Active";
      else cate.active = "Pending";
      cate.modifyDate = new Date();
      cate.save(async (err) => {
        if (err) {
          return res.json({ success: false, errMessage: "Unknown errors" });
        } else {
          let ledgers = await Certification.find()
            .populate(["nurseId"])
            .sort({ modifyDate: 1 });
          res.status(200).json({
            success: true,
            certifications: ledgers,
            curcertification: cate,
          });
        }
      });
    }
  });
};
exports.deleteCertification = (req, res) => {
  console.log("-delete Certification-");
  console.log(req.body.id);
  var id = req.body.id;
  Certification.findByIdAndRemove(
    id,
    {
      new: true,
      useFindAndModify: false,
    },
    async function (err, ledger) {
      if (err) {
        res.json({
          success: false,
          errMessage: "Unknown errors occurred while deleting Certifications.",
        });
      } else {
        let ledgers = await Nurse.find()
          .populate(["nurseId"])
          .sort({ modifyDate: 1 });
        return res.json({ success: true, certifications: ledgers });
      }
    }
  );
};
exports.deletesCertification = (req, res) => {
  console.log("-deletes Certification-");
  var arrId = req.body.str;
  console.log(req.body.str);
  arrId.forEach(async (element, index) => {
    await Certification.findByIdAndRemove(
      element,
      {
        new: true,
        useFindAndModify: false,
      },
      async function (err, ledger) {
        if (err) {
          return res.json({
            success: false,
            errMessage:
              "Unknown errors occurred while deleting Certifications.",
          });
        } else {
          if (arrId.length == index + 1) {
            let ledgers = await Nurse.find()
              .populate(["nurseId"])
              .sort({ modifyDate: 1 });
            return res.json({ success: true, certifications: ledgers });
          }
        }
      }
    );
  });
};
exports.getAllCertification = async (req, res) => {
  // console.log('this is call');
  await Certification.find()
    .populate(["nurseId"])
    .sort({ modifyDate: 1 })
    .exec(function (err, users) {
      if (err) {
        // console.log('rrrrreee');
        return res.json({
          success: false,
          errMessage:
            "Unknown errors occurred while getting all Certifications.",
        });
      } else {
        // console.log(users);
        return res.json({ success: true, certifications: users });
      }
    });
};

exports.getsAllCertification_fronted = async (req, res) => {
  console.log("this is call2");
  await Certification.find({ active: "Active" })
    .populate(["nurseId"])
    .sort({ modifyDate: 1 })
    .exec(function (err, users) {
      if (err) {
        // console.log('rrrrreee11');
        return res.json({
          success: false,
          errMessage:
            "Unknown errors occurred while getting all Certifications.",
        });
      } else {
        return res.json({ success: true, certifications: users });
      }
    });
};

exports.getAllNotifications = async (req, res) => {
  // console.log("this is call3");
  // console.log("new uidddd " + req.body.id);

  today = new Date();
  var id = req.body.id;
  if (id === "admin") {
    await Certification.find({ date_expiry: { $lte: today } })
      .populate(["nurseId"])
      .sort({ date_expiry: 1 })
      .exec(function (err, users) {
        if (err) {
          // console.log('rrrrreee11');
          return res.json({
            success: false,
            errMessage:
              "Unknown errors occurred while getting all Certifications.",
          });
        } else {
          return res.json({ success: true, notifications: users });
        }
      });
  } else {
    await Certification.find({
      $and: [
        { date_expiry: { $lte: today } },
        { nurseId: { $eq: mongoose.Types.ObjectId(id) } },
      ],
    })
      .populate(["nurseId"])
      .sort({ date_expiry: 1 })
      .exec(function (err, users) {
        if (err) {
          // console.log('rrrrreee11');
          return res.json({
            success: false,
            errMessage:
              "Unknown errors occurred while getting all Certifications.",
          });
        } else {
          return res.json({ success: true, notifications: users });
        }
      });
  }
};
exports.getNurseDetails = async (req, res) => {
  var arrId = req.body.str;
  await Nurse.find({ _id: arrId })
    .populate(["category"])
    .sort({ reviewRating: 1 })
    .exec(function (err, users) {
      if (err) {
        return res.json({
          success: false,
          errMessage: "Unknown errors occurred while getting Nurses.",
        });
      } else {
        return res.json({ success: true, nurses: users });
      }
    });
};
