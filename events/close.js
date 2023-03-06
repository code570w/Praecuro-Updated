const store = require('../store');

module.exports = (socket, data) => {
    const { user } = data;
    store.socketsByUserID[user._id].forEach(socket => {
        store.io.to(socket.id).emit('close', data);
    });
};
