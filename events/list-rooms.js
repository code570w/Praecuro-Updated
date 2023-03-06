// const Room = require('../models/Room');
var mongoose = require('mongoose');
const Room = mongoose.model('rooms');



// const Message = mongoose.model('Message');
module.exports = (socket, data) => {

    // console.log(`hiii5 ${data}`);
    
    console.log('Received list rooms event', JSON.stringify(data));
    console.log('cccc11bbb');
    let { limit } = data;

    !limit && (limit = 30);
    // console.log(socket.decoded_token.id,socket.decoded_token.id);
    Room.find({
            $or:[
                { peopleClient: socket.decoded_token.id},
                { peopleNurse: socket.decoded_token.id},
            ],
            // people: { $in: [socket.decoded_token.id] },
            // lastMessage: { $ne: null }
        })
        .sort({lastUpdate: -1})
        // .populate({
        //     path: 'people',
        //     select: '-email -password -friends -__v',
        // })
        .populate('peopleClient')
        .populate('peopleNurse')
        .populate('lastMessage')
        .limit(limit)
        .exec((err, rooms) => {
            console.log('hiiii list root',rooms)
            if (err) return socket.emit('list-rooms', { status: 500 });
            socket.emit('list-rooms', { limit, status: 200, rooms });
        });
};
