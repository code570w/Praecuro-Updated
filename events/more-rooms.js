// const Room = require('../models/Room');
var mongoose = require('mongoose');
const Room = mongoose.model('rooms');
module.exports = (socket, data) => {
    console.log('Received join room event', JSON.stringify(data));
    console.log('cccc55');
    let { roomID } = data;

    Room.find({
        // people: { $in: [socket.decoded_token.id] },
        $or:[
            {peopleClient:socket.decoded_token.id},
            {peopleNurse:socket.decoded_token.id}
        ],
        lastMessage: { $ne: null },
        lastUpdate: {$lt: roomID},
    }).sort({lastUpdate: -1}).limit(20)
        // .populate({
        //     path: 'people',
        //     select: '-email -password -friends -__v',
        //     populate: {
        //         path: 'picture',
        //     },
        // })
        .populate('lastMessage')
        .populate('peopleNurse')
        .populate('peopleClient')
        .then(rooms => {
            socket.emit('more-rooms', {status: 200, rooms});
    });
};
