// const Message = require('../models/Message');
// const Room = require('../models/Room');
var mongoose = require('mongoose');
const Room = mongoose.model('rooms');
const Message = mongoose.model('messages');
module.exports = (socket, data) => {
    console.log('Received join room event', JSON.stringify(data));

    let { roomID } = data;

    const findMessagesAndEmit = room => {
        Message.find({room: room._id}).sort({_id: -1}).limit(20)
        // .populate({
        //     path: 'author',
        //     select: '-email -password -friends -__v',
        //     populate: {
        //         path: 'picture',
        //     },
        // })
        .populate('authorClient')
        .populate('authorNurse')
        .then(messages => {
            messages.reverse();
            // Message.find({room: room._id, type: 'image'}).sort({_id: -1}).limit(14).populate({
            //     path: 'author',
            //     select: '-email -password -friends -__v',
            //     populate: {
            //         path: 'picture',
            //     },
            // }).then(images => {
                socket.emit('join-room', {status: 200,
                    room: {
                        _id: room._id,
                        peopleClient: room.peopleClient,
                        peopleNurse: room.peopleNurse,
                        title: room.title,
                        lastUpdate: room.lastUpdate,
                        lastNurse: room.lastNurse,
                        lastClient: room.lastClient,
                        lastMessage: room.lastMessage,
                        // picture: room.picture,
                        messages,
                        // images,
                    }
                // });
            });
        });
    };

    Room.findOne({_id: roomID})
        // .populate('picture')
        .populate('peopleClient')
        .populate('peopleNurse')
        // .populate({
        //     path: 'people',
        //     select: '-email -tagLine -password -friends -__v',
        //     populate: [{
        //         path: 'picture',
        //     }],
        // })
        .exec((err, room) => {
            console.log({err,room});
            if (err) return socket.emit('join-room', { status: 500 });
            findMessagesAndEmit(room)
        });
};
