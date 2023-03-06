// const Message = require('../models/Message');
// const Room = require('../models/Room.model');
var mongoose = require("mongoose");
const Room = mongoose.model("rooms");
const Message = mongoose.model("messages");

module.exports = (socket, data) => {
  // console.log('Received create room event', JSON.stringify(data));
  // console.log(`hiii4 ${data}`);
  console.log("param socket");

  // console.log('socketde',socket)

  console.log("cccc", data);

  let { counterpart } = data;

  console.log("counterpart", counterpart);
  const data_splits = counterpart.split("_");
  console.log(data_splits);

  const counterpart1 = data_splits[0];
  console.log("counterpart11", counterpart1);

  const types_v = data_splits[1];

  console.log("types_v", types_v);

  const findMessagesAndEmit = (room) => {
    Message.find({ room: room._id })
      .sort({ _id: -1 })
      .limit(20)
      // .populate({
      //     path: '',
      //     select: '-email -password -friends -__v',
      //     populate: {
      //         path: 'picture',
      //     },
      // })
      .populate("authorClient")
      .populate("authorNurse")
      .then((messages) => {
        // Message.find({room: room._id, type: 'image'}).sort({_id: -1}).limit(14).populate({
        //     path: 'author',
        //     select: '-email -password -friends -__v',
        //     populate: [{
        //         path: 'picture',
        //     }],
        // }).then(images => {
        messages.reverse();
        socket.emit("create-room", {
          status: 200,
          room: {
            _id: room._id,
            peopleNurse: room.peopleNurse,
            peopleClient: room.peopleClient,
            lastUpdate: room.lastUpdate,
            lastClient: room.lastClient,
            lasNurse: room.lasNurse,
            lastMessage: room.lastMessage,
            messages,
          },
        });
        // });
      });
  };

  if (types_v == "clint") {
    var user_ids = counterpart1;
    var token_ids = socket.decoded_token.id;
  } else {
    user_ids = socket.decoded_token.id;
    token_ids = counterpart1;
  }

  console.log(user_ids, token_ids);
  Room.findOne(
    {
      $and: [
        {
          peopleClient: user_ids,
        },
        {
          peopleNurse: token_ids,
        },
      ],
    }

    // {peopleNurse: socket.decoded_token.id}
    // people: { $all : [socket.decoded_token.id, counterpart]}
  )
    .populate("peopleClient")
    .populate("peopleNurse")
    // .populate({
    // path: 'people',
    // select: '-email -password -friends -__v',
    // populate: [{
    //     path: 'picture',
    // }],
    // })
    .exec((err, room) => {
      if (err) return socket.emit("create-room", { status: 500 });
      console.log("room_data", room);
      console.log(
        "=================================room========================================="
      );
      if (room != null && room != undefined) {
        findMessagesAndEmit(room);
      } else {
        console.log("hiiiiiiiiiiiiiiiiiiiiiii");
        Room({ peopleClient: user_ids, peopleNurse: token_ids })
          .save()
          .then((room) => {
            console.log("ceate root", room);
            Room.findOne({ _id: room._id })
              .populate("peopleClient")
              .populate("peopleNurse")
              .then((room) => {
                findMessagesAndEmit(room);
              });
          });
      }
    });
};
