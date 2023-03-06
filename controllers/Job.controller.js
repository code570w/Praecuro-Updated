var mongoose = require("mongoose");
const Job = mongoose.model("Job");
const nodemailer = require("nodemailer");
var Config = require("../config/config");
const NurseCategory = mongoose.model("NurseCategory");
const Nurse = mongoose.model("Nurse");
const Client = mongoose.model("Client");
const Bid = mongoose.model("Bid");
const Review = mongoose.model("Review");
const stripe = require("stripe")(
  "sk_test_51JpZHoESImW743YHZDXVzbv136Dq2OoWCsrmfIPkR5HaBoIIE3cG5wiW2ixnuUpzKwBgwPCXODgoXS64GAcCpTPS008PK5wUSy"
);
// Job Management
exports.addJob = (req, res) => {
  console.log("--- AddJob - Backend ---");
  // console.log(req.body)
  // console.log('newNurse',req.body);

  Job.findOne({}).then(async (cate) => {
    // console.log('result',result);
    //    process.exit();

    const charge = await stripe.charges.create({
      amount: req.body.peypay_amount * 100,
      currency: "usd",
      customer: req.body.customerSource.id,
    });

    let newNurse = new Job(req.body);
    newNurse.startDate = new Date();
    newNurse.modifyDate = new Date();

    // console.log('charge',charge);
    // process.sexit();

    newNurse.prepay_arr = charge;
    newNurse.paymentToken = req.body.paymentToken;
    newNurse.customerSource = req.body.customerSource;
    newNurse.save(async (err) => {
      if (err) {
        return res.json({ success: false, errMessage: "Unknown errors" });
      } else {
        Client.findOne({ _id: req.body.client })
          .then((result) => {
            // console.log('nodemailer',nodemailer.createTransport);
            var transporter = nodemailer.createTransport({
              // host: 'smtp.gmail.com',
              // port: 587,
              // secure: false,
              // service: 'gmail',
              // host: "smtp.gmail.com",
              // port: 465,
              // ignoreTLS: false,
              // secure: true,
              // pool: true,

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
            // console.log('transporter15',transporter);
            transporter.verify(function (error, success) {
              if (error) {
                console.log("verification err", error);
              } else {
                console.log("server is ready to send emails");
              }
            });

            // praecuroapp@gmail.com
            var mailOptions = {
              from: "praecuroapp@gmail.com",
              to: result.email,
              subject: "New Job Post",
              //You can use "html:" to send HTML email content. It's magic!
              html: `<h3>Hello ${result.firstName}</h3><br> <p>New job Posted successfull</p>`,
            };
            // console.log('ho ',transporter.options.host);
            // console.log(mailOptions)
            // console.log('transporter',transporter)
            transporter.sendMail(mailOptions, function (error, info) {
              if (error) {
                console.log("Email send failed:", error);
              } else {
                console.log("Email sent: " + info.response);
              }
            });
          })
          .catch((err) => {
            console.log("error--", err);
          });

        let ledgers = await Job.find()
          .populate(["category", "client", "nurse"])
          .sort({ modifyDate: 1 });
        res.status(200).json({ success: true, jobs: ledgers });
      }
    });
  });
};

exports.updateJob = (req, res) => {
  console.log("-backend update category -");
  console.log(req.body);
  Job.findOne({ _id: req.body._id }).then((cate) => {
    if (!cate) {
      res.json({ success: false, errMessage: "Don't exist this Job" });
    } else {
      cate.modifyDate = new Date();
      Object.assign(cate, req.body);
      cate.save(async (err) => {
        if (err) {
          return res.json({ success: false, errMessage: "Unknown errors" });
        } else {
          let ledgers = await Job.find()
            .populate(["category", "client", "nurse"])
            .sort({ modifyDate: 1 });
          res.status(200).json({ success: true, jobs: ledgers, curjob: cate });
        }
      });
    }
  });
};
exports.updateJobStatus = (req, res) => {
  console.log("-backend update Status -");
  console.log(req.body._id);
  // console.log(req.body)
  Job.findOne({ _id: req.body._id }).then((cate) => {
    if (!cate) {
      res.json({ success: false, errMessage: "Don't exist this Job" });
    } else {
      cate.modifyDate = new Date();
      // Object.assign(cate,req.body);
      if (cate.status == "Pending") cate.status = "In Progress";
      else if (cate.status == "In Progress") cate.status = "Cancelled";
      else if (cate.status == "Cancelled") cate.status = "Completed";
      else cate.status = "Pending";
      cate.save(async (err) => {
        if (err) {
          return res.json({ success: false, errMessage: "Unknown errors" });
        } else {
          let ledgers = await Job.find().populate([
            "category",
            "client",
            "nurse",
          ]);
          res.status(200).json({ success: true, jobs: ledgers, curjob: cate });
        }
      });
    }
  });
};
exports.setAward = (req, res) => {
  console.log("-backend update Status -");
  // console.log(req.body._id)
  console.log("mm", req.body.job);
  // console.log(req.body)
  Job.findOne({ _id: req.body.job }).then((cate) => {
    if (!cate) {
      res.json({ success: false, errMessage: "Don't exist this Job" });
    } else {
      cate.modifyDate = new Date();
      // Object.assign(cate,req.body);
      cate.nurse = req.body.nurse;
      cate.save(async (err) => {
        if (err) {
          return res.json({ success: false, errMessage: "Unknown errors" });
        } else {
          let ledgers = await Job.find().populate([
            "category",
            "client",
            "nurse",
          ]);
          res.status(200).json({ success: true, jobs: ledgers, curjob: cate });
        }
      });
    }
  });
};
exports.setComplete = (req, res) => {
  console.log("-backend update setComplete -");
  // console.log(req.body)
  Job.findOne({ _id: req.body.jobID }).then((cate) => {
    if (!cate) {
      res.json({ success: false, errMessage: "Don't exist this Job" });
    } else {
      cate.modifyDate = new Date();
      cate.status = "Completed";
      cate.save(async (err) => {
        if (err) {
          return res.json({ success: false, errMessage: "Unknown errors" });
        } else {
          let ledgers = await Job.find().populate([
            "category",
            "client",
            "nurse",
          ]);
          res.status(200).json({ success: true, jobs: ledgers, curjob: cate });
        }
      });
    }
  });
};
exports.deleteJob = (req, res) => {
  console.log("-delete Job-");
  console.log(req.body.id);
  var id = req.body.id;
  Job.findByIdAndRemove(
    id,
    {
      new: true,
      useFindAndModify: false,
    },
    async function (err, ledger) {
      if (err) {
        res.json({
          success: false,
          errMessage: "Unknown errors occurred while deleting Job.",
        });
      } else {
        let ledgers = await Job.find()
          .populate(["category", "client", "nurse"])
          .sort({ modifyDate: 1 });
        return res.json({ success: true, jobs: ledgers });
      }
    }
  );
};
exports.deletesJob = (req, res) => {
  console.log("-deletes Job-");
  var arrId = req.body.str;
  console.log(req.body.str);
  arrId.forEach(async (element, index) => {
    await Job.findByIdAndRemove(
      element,
      {
        new: true,
        useFindAndModify: false,
      },
      async function (err, ledger) {
        if (err) {
          return res.json({
            success: false,
            errMessage: "Unknown errors occurred while deleting Jobs.",
          });
        } else {
          if (arrId.length == index + 1) {
            let ledgers = await Job.find()
              .populate(["category", "client", "nurse"])
              .sort({ modifyDate: 1 });
            return res.json({ success: true, jobs: ledgers });
          }
        }
      }
    );
  });
};
exports.getAllJob = async (req, res) => {
  console.log("req", req);
  // const user_id=req.body._id;
  await Job.find({ status: "In Progress" })
    .populate(["category", "client", "nurse"])
    .exec(function (err, users) {
      if (err) {
        return res.json({
          success: false,
          errMessage: "Unknown errors occurred while getting all Jobs.",
        });
      } else {
        console.log("usersss", users);

        return res.json({ success: true, jobs: users });
      }
    });
};
exports.getAllJobShow = async (req, res) => {
  await Job.find({ status: "In Progress" })
    .populate(["category", "client"])
    .exec(function (err, users) {
      if (err) {
        return res.json({
          success: false,
          errMessage: "Unknown errors occurred while getting all Jobs.",
        });
      } else {
        return res.json({ success: true, jobs: users });
      }
    });
};
exports.getSelJob = async (req, res) => {
  await Job.findOne({ email: req.body.email })
    .populate(["category", "client"])
    .exec(function (err, users) {
      if (err) {
        return res.json({
          success: false,
          errMessage: "Unknown errors occurred while getting all Jobs.",
        });
      } else {
        return res.json({ success: true, jobs: users });
      }
    });
};

// BID
exports.addBid = (req, res) => {
  console.log("--- AddJob - Backend ---");
  console.log(req.body);
  Bid.findOne({}).then((cate) => {
    let newNurse = new Bid(req.body);
    newNurse.startDate = new Date();
    newNurse.modifyDate = new Date();
    newNurse.save(async (err) => {
      if (err) {
        return res.json({ success: false, errMessage: "Unknown errors" });
      } else {
        Job.findOne({ _id: req.body.job }).then((cate1) => {
          if (!cate1) {
          } else {
            cate1.modifyDate = new Date();
            cate1.count++;
            cate1.save(async (err) => {});
          }
        });
        let ledgers = await Bid.find()
          .populate(["job", "nurse"])
          .sort({ modifyDate: 1 });
        res.status(200).json({ success: true, bids: ledgers });
      }
    });
  });
};
exports.updateBid = (req, res) => {
  console.log("-backend update category -");
  console.log(req.body);
  Bid.findOne({ _id: req.body._id }).then((cate) => {
    if (!cate) {
      res.json({ success: false, errMessage: "Don't exist this Job" });
    } else {
      cate.modifyDate = new Date();
      Object.assign(cate, req.body);
      cate.save(async (err) => {
        if (err) {
          return res.json({ success: false, errMessage: "Unknown errors" });
        } else {
          let ledgers = await Bid.find()
            .populate(["job", "nurse"])
            .sort({ modifyDate: 1 });
          res.status(200).json({ success: true, bids: ledgers, curbid: cate });
        }
      });
    }
  });
};
exports.deleteBid = (req, res) => {
  console.log("-delete Job-");
  console.log(req.body.id);
  var id = req.body.id;
  Bid.findByIdAndRemove(
    id,
    {
      new: true,
      useFindAndModify: false,
    },
    async function (err, ledger) {
      if (err) {
        res.json({
          success: false,
          errMessage: "Unknown errors occurred while deleting Job.",
        });
      } else {
        let ledgers = await Bid.find()
          .populate(["job", "nurse"])
          .sort({ modifyDate: 1 });
        return res.json({ success: true, bids: ledgers });
      }
    }
  );
};
exports.deletesBid = (req, res) => {
  console.log("-deletes Bid-");
  var arrId = req.body.str;
  console.log(req.body.str);
  arrId.forEach(async (element, index) => {
    await Bid.findByIdAndRemove(
      element,
      {
        new: true,
        useFindAndModify: false,
      },
      async function (err, ledger) {
        if (err) {
          return res.json({
            success: false,
            errMessage: "Unknown errors occurred while deleting Jobs.",
          });
        } else {
          if (arrId.length == index + 1) {
            let ledgers = await Bid.find()
              .populate(["job", "nurse"])
              .sort({ modifyDate: 1 });
            return res.json({ success: true, bids: ledgers });
          }
        }
      }
    );
  });
};
exports.getAllBid = async (req, res) => {
  await Bid.find()
    .populate(["job", "nurse"])
    .exec(function (err, users) {
      if (err) {
        return res.json({
          success: false,
          errMessage: "Unknown errors occurred while getting all Jobs.",
        });
      } else {
        return res.json({ success: true, bids: users });
      }
    });
};
exports.getBid = async (req, res) => {
  await Bid.findOne({ job: req.body.job })
    .populate(["category", "client"])
    .exec(function (err, users) {
      if (err) {
        return res.json({
          success: false,
          errMessage: "Unknown errors occurred while getting all Jobs.",
        });
      } else {
        return res.json({ success: true, bids: users });
      }
    });
};

// Review
exports.getReview = async (req, res) => {
  await Review.find()
    .populate(["fromClient", "fromNurse", "toClient", "toNurse", "job"])
    .exec(function (err, users) {
      if (err) {
        return res.json({
          success: false,
          errMessage: "Unknown errors occurred while getting all Jobs.",
        });
      } else {
        return res.json({ success: true, reviews: users });
      }
    });
};
exports.setReview = (req, res) => {
  console.log("--- AddReview - Backend ---");
  console.log(req.body);
  Review.findOne({}).then((cate) => {
    let newNurse = new Review(req.body);
    newNurse.reviewDate = new Date();
    newNurse.save(async (err) => {
      if (err) {
        console.log("err", err);
        return res.json({ success: false, errMessage: "Unknown errors" });
      } else {
        Job.findOne({ _id: req.body.job }).then((cate1) => {
          if (!cate1) {
            console.log("err1", err);
            res.json({ success: false, errMessage: "Don't exist this Job" });
          } else {
            cate1.modifyDate = new Date();
            if (req.body.fromClient != null) cate1.review += "Client";
            else cate1.review += "Nurse";
            cate1.save(async (err) => {
              if (err) {
                return res.json({
                  success: false,
                  errMessage: "Unknown errors",
                });
              } else {
                console.log("1");
                let ledgers = await Job.find().populate([
                  "category",
                  "client",
                  "nurse",
                ]);
                let ledgers2 = await Bid.find()
                  .populate(["job", "nurse"])
                  .sort({ modifyDate: 1 });
                let ledgers1 = await Review.find().populate([
                  "fromNurse",
                  "fromClient",
                  "toNurse",
                  "toClient",
                  "job",
                ]);
                res.status(200).json({
                  success: true,
                  jobs: ledgers,
                  reviews: ledgers1,
                  bids: ledgers2,
                  curjob: cate1,
                });
              }
            });
          }
        });
      }
    });
  });
};
