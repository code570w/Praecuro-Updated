const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const dotenv = require("dotenv");
const Mongoose = require("./config/mongoose");
const MongoDB = require("./config/mongodb");
var mongoose_ = require("mongoose");
const cors = require("cors");
const app = express();
const fileUpload = require("express-fileupload");
const io = require("socket.io");
const store = require("./store");
const http = require("http");
const socketioJwt = require("socketio-jwt");
const { socketIds } = require("./store");

// const Job = mongoose_.model('Job')

const Job = require("./models/Job.model");
const Certification = require("./models/Certification.model");
const Bid = require("./models/Bid.model");
const Nurse = require("./models/Nurse.model");
const stripe = require("stripe")(
  "sk_test_51JpZHoESImW743YHZDXVzbv136Dq2OoWCsrmfIPkR5HaBoIIE3cG5wiW2ixnuUpzKwBgwPCXODgoXS64GAcCpTPS008PK5wUSy"
);
dotenv.config();

//Bodyparser middleware
app.use(
  express.urlencoded({
    extended: false,
  })
);
app.use(express.json());
app.use(fileUpload());

app.get("/", (req, res) => {
  return res.send("this is alive");
});

// app.use(express.static("src"));

//   app.get('*', function (req, res) {
//     res.send('ggdf');
//   })

// console.log('ddd',process.env.NODE_ENV);
// if(process.env.NODE_ENV === 'production') {
// app.use(express.static("client/build"));

// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "client", "build", "index.html"));
// });
// }

app.use(cors());

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

//Connect to mongodb
var mongo = MongoDB();
var mongoose = Mongoose();
const events = require("./events");

app.post("/getjob", async (req, res) => {
  const get_userid = req.body.user_id;
  //   console.log('get_userid',get_userid);
  //   status:'In Progress'
  await Job.find({ client: get_userid })
    .populate(["category", "client", "nurse"])
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
});

app.post("/getjob-nurse", async (req, res) => {
  const get_userid = req.body.user_id;
  //   console.log('get_userid',get_userid);
  //   status:'In Progress'
  await Job.find({ nurse: get_userid })
    .populate(["category", "client", "nurse"])
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
});

app.post("/certificatesDetails", async (req, res) => {
  const get_nid = req.body.user_id;
  console.log("nuseid ", get_nid);
  await Certification.find({ nurseId: get_nid })
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
});

app.post("/getBidsData", async (req, res) => {
  const get_jobid = req.body.job_id;
  // console.log('bidd ',get_jobid);
  await Bid.find({ job: get_jobid })
    .populate(["job", "nurse"])
    .exec(function (err, users) {
      if (err) {
        return res.json({
          success: false,
          bids: [],
          errMessage: "Unknown errors occurred while getting all Jobs.",
        });
      } else {
        return res.json({ success: true, bids: users });
      }
    });
});

app.post("/getNursesLat_lon", async (req, res) => {
  const get_data = req.body.data;
  const subText = req.body.subText;
  const filterCategory = req.body.filterCategory;
  const filReview = req.body.filReview;
  const filRangeBudge = req.body.filRangeBudge;
  const filterMiles = req.body.filterMiles;

  // console.log('get_data',get_data.results[0].geometry);

  if (get_data.status == "OK") {
    if (subText == undefined || subText == "") {
      var subText_json = "";
    } else {
      subText_json = { title: { $regex: ".*" + subText + ".*" } };
    }

    if (filterCategory == undefined || filterCategory == "All Category") {
      var filterCategory_json = "";
    } else {
      filterCategory_json = { category: filterCategory };
    }

    if (filReview == undefined) {
      var filReview_json = "";
    } else {
      filReview_json = { reviews: filReview[1] };
    }

    if (filRangeBudge == undefined) {
      var filRangeBudge_json = "";
    } else {
      filRangeBudge_json = { salary: { $lte: filRangeBudge[1] } };
    }

    if (filterMiles == undefined || filterMiles == "Miles") {
      var filterMiles_json = Number(5) * Number(1609.344);
    } else {
      filterMiles_json = Number(filterMiles) * Number(1609.344);
    }

    console.log("subText", subText_json);
    console.log("filterCategory", filterCategory_json);
    console.log("filReview", filReview_json);
    console.log("filRangeBudge", filRangeBudge_json);
    console.log("filterMiles", filterMiles_json);
    console.log(get_data);

    var farr = [
      subText_json,
      filterCategory_json,
      filReview_json,
      filRangeBudge_json,
    ];

    var filtered = farr.filter(function (el) {
      return el != "";
    });

    if (filtered.length == 0) {
      var orv = [{ salary: { $lte: 10000 } }];
    } else {
      orv = filtered;
    }

    //   console.log('farr',orv)

    const long = get_data.results[0].geometry.location.lng;
    const latt = get_data.results[0].geometry.location.lat;

    console.log(long, latt);

    await Nurse.find({
      loc: {
        $near: {
          $minDistance: 0,
          $maxDistance: filterMiles_json,
          $geometry: {
            type: "Point",
            coordinates: [long, latt],
          },
        },
      },
      $and: orv,
    })
      .populate(["category"])
      .sort({ reviewRating: 1 })
      .exec(function (err, users) {
        if (err) {
          return res.json({
            success: false,
            errMessage: "Unknown errors occurred while getting all Nurses.",
          });
        } else {
          // console.log("users...", users);
          return res.json({ success: true, nurses: users });
        }
      });
  } else {
    return res.json({ success: true, nurses: [] });
  }
});

app.post("/getAllJobs_kris", async (req, res) => {
  // console.log('req',req.body);
  const get_data = req.body.data;
  const subText = req.body.subText;
  const filterCategory = req.body.filterCategory;
  const filReview = req.body.filReview;
  const filRangeBudge = req.body.filRangeBudge;
  const filterMiles = req.body.filterMiles;

  if (get_data.status == "OK") {
    if (subText == undefined || subText == "") {
      var subText_json = "";
    } else {
      subText_json = { title: { $regex: ".*" + subText + ".*" } };
    }

    if (filterCategory == undefined || filterCategory == "All Category") {
      var filterCategory_json = "";
    } else {
      filterCategory_json = { category: filterCategory };
    }

    if (filReview == undefined) {
      var filReview_json = "";
    } else {
      // filReview[1]
      filReview_json = { review: "" };
    }

    if (filRangeBudge == undefined) {
      var filRangeBudge_json = "";
    } else {
      filRangeBudge_json = { budget: { $lte: filRangeBudge[1] } };
    }

    if (filterMiles == undefined || filterMiles == "Miles") {
      var filterMiles_json = Number(5) * Number(1609.344); // 1 miles =1609.244 Meter
    } else {
      filterMiles_json = Number(filterMiles) * Number(1609.344);
    }

    //  console.log('subText',subText_json);
    // console.log('filterCategory',filterCategory_json);
    // console.log('filReview',filReview_json);
    // console.log('filRangeBudge',filRangeBudge_json);
    // console.log('filterMiles',filterMiles_json);
    // console.log(get_data);
    var farr = [
      subText_json,
      filterCategory_json,
      filReview_json,
      filRangeBudge_json,
    ];

    var filtered = farr.filter(function (el) {
      return el != "";
    });

    if (filtered.length == 0) {
      var orv = [{ budget: { $lte: 10000 } }];
    } else {
      orv = filtered;
    }
    //   console.log('farr',orv)
    // In Progress
    // console.log('get_datanew',get_data.results[0].geometry);
    const long = get_data.results[0].geometry.location.lng;
    const latt = get_data.results[0].geometry.location.lat;
    console.log("get_datanew", long, latt);
    await Job.find({
      loc: {
        $near: {
          $minDistance: 0,
          $maxDistance: filterMiles_json,
          $geometry: {
            type: "Point",
            coordinates: [long, latt],
          },
        },
      },
      $and: [{ status: "In Progress" }],
      $and: orv,
    })
      .populate(["category", "client", "nurse"])
      .exec(function (err, users) {
        if (err) {
          console.log(err);
          return res.json({
            success: false,
            errMessage: "Unknown errors occurred while getting all Jobs.",
          });
        } else {
          // console.log('usersss_new',users);
          return res.json({ success: true, jobs: users });
        }
      });
  } else {
    return res.json({ success: true, jobs: [] });
  }
});

// console.log('get_data',get_data.results[0].geometry.location);

app.post("/createAdminAcount", async (req, res) => {
  const tempData = req.body.tempData;

  const token = await stripe.tokens.create({
    bank_account: {
      country: tempData.country,
      currency: tempData.currency,
      account_holder_name: tempData.accountHolderName,
      account_holder_type: tempData.accountHolderType,
      routing_number: tempData.routingNumber,
      account_number: tempData.accountNumber,
    },
  });

  console.log("token.id", token);

  if (token) {
    const account = await stripe.accounts.create({
      type: "custom",
      country: tempData.country,
      email: tempData.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    console.log("account", account);
  }
  // process.exit();
  console.log("tempData", token);
});

// app.post('/withdrawpayout',async(req,res)=>{

//     const getamount=req.body.amount;

//     if(getamount!="" || getamount!=undefined || getamount!=null){

//         const payout = await stripe.payouts.create({
//             amount: getamount,
//             currency: 'usd',
//           });

//           console.log('payout',payout);

//     }

// })

//Routes

// require('./routes/PageLink.routes')(app);
// require('./routes/ShortCut.routes')(app);
// require('./routes/Activity.routes')(app);
// require('./routes/FileUpload.routes')(app);
// require('./routes/Ledger.routes')(app);

const server = http.createServer(app);
// console.log(server);

store.app = app;
// store.config = Config;
store.io = io(server);

// console.log('store.io.sockets',store.io.sockets);
// store.io.sockets.on('connection',()=>{
//     console.log('this is call');

// })

store.io.sockets
  .on(
    "connection",
    socketioJwt.authorize({
      secret: "jwt-default-secret",
      timeout: 15000, // 15 seconds to send the authentication message
    })
  )
  .on("authenticated", (socket) => {
    // console.log(' -- authenticated --')
    // console.log('decode_token', socket.decoded_token)
    const { email, id } = socket.decoded_token;
    // console.log('email', email)
    // console.log('id',id)
    // console.log('socketID',socket.id)
    // console.log(`Socket connected: ${email}`.cyan);
    // console.log('=================server_home===================',events);
    // socket.on(events[1].tag, data => events[1].callback(socket, data));

    // events.forEach((event)=>{
    // socket.on(event.tag, data => event.callback(socket, data))
    // console.log(event.tag,event.callback(socket));
    // });

    events.forEach((event) =>
      socket.on(event.tag, (data) => event.callback(socket, data))
    );

    store.socketIds.push(socket.id);
    store.sockets[socket.id] = socket;

    if (!store.socketsByUserID[id]) store.socketsByUserID[id] = [];
    store.socketsByUserID[id].push(socket);
    store.userIDsBySocketID[socket.id] = id;

    socket.on("unauthorized", (error, callback) => {
      console.log("Unauthorized user attempt.");
      if (
        error.data.type === "UnauthorizedError" ||
        error.data.code === "invalid_token"
      ) {
        // redirect user to login page perhaps or execute callback:
        callback();
        console.log("User token has expired");
      }
    });

    const removeSocket = (array, element) => {
      let result = [...array];
      let i = 0;
      let found = false;
      while (i < result.length && !found) {
        if (element.id === array[i].id) {
          result.splice(i, 1);
          found = true;
        }
        i++;
      }
      return result;
    };

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${email}`.cyan);
      store.socketIds.splice(store.socketIds.indexOf(socket.id), 1);
      store.sockets[socket.id] = undefined;
      store.socketsByUserID[id] = removeSocket(
        store.socketsByUserID[id],
        socket
      );
      if (store.online.includes(store.userIDsBySocketID[socket.id]))
        store.online.splice(
          store.online.indexOf(store.userIDsBySocketID[socket.id]),
          1
        );
      if (store.busy.includes(store.userIDsBySocketID[socket.id]))
        store.busy.splice(
          store.busy.indexOf(store.userIDsBySocketID[socket.id]),
          1
        );
      if (store.away.includes(store.userIDsBySocketID[socket.id]))
        store.away.splice(
          store.away.indexOf(store.userIDsBySocketID[socket.id]),
          1
        );
      if (store.available.includes(store.userIDsBySocketID[socket.id]))
        store.available.splice(
          store.available.indexOf(store.userIDsBySocketID[socket.id]),
          1
        );
      store.io.emit("offline", store.userIDsBySocketID[socket.id]);
    });
  });

require("./routes/Admin.routes")(app);
require("./routes/Auth.routes")(app);
require("./routes/User.routes")(app);
require("./routes/Job.routes")(app);
require("./routes/Payment.routes")(app);
require("./routes/Email.routes")(app);
require("./routes/Client.routes")(app);
require("./routes/Nurse.routes")(app);

const port = process.env.PORT || 4000; //process.env.port is Heroku's port if you choose to deplay the app there
// app.listen(port, () => console.log("Server up and running on port " + port));
const listen = () =>
  server.listen(port, () => console.log(`Server listening on port ${port}`));
// console.log(store)
server.on("error", (e) => {
  if (e.code === "EADDRINUSE") {
    console.log("Specified port unavailable, retrying in 10 seconds...".red);
    setTimeout(() => {
      server.close();
      server.listen(port);
    }, 10000);
  }
});
listen();
