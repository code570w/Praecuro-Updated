const User = require("../models/User");
Config = { ...require("../defaults"), ...require("../../config") };

module.exports = (socket, data) => {
  console.log("Received search event", JSON.stringify(data));

  let { search, limit, more } = data;

  !limit && (limit = 25);

  User.aggregate()
    .project({
      fullName: { $concat: ["$firstName", " ", "$lastName"] },
      firstName: 1,
      lastName: 1,
      username: 1,
      email: 1,
      picture: 1,
      tagLine: 1,
    })
    .match({
      $and: [
        {
          $or: [
            { fullName: { $regex: `.*${search}.*`, $options: "i" } },
            { email: { $regex: `.*${search}.*`, $options: "i" } },
            { username: { $regex: `.*${search}.*`, $options: "i" } },
            { firstName: { $regex: `.*${search}.*`, $options: "i" } },
            { lastName: { $regex: `.*${search}.*`, $options: "i" } },
          ],
        },
        {
          email: { $ne: socket.decoded_token.email },
        },
      ],
    })
    .sort({ _id: -1 })
    .limit(limit)
    .exec((err, users) => {
      User.populate(users, { path: "picture" }, (err, users) => {
        if (err) return socket.emit("search", { status: 500 });
        socket.emit("search", { search, limit, more, status: 200, users });
      });
    });
};
