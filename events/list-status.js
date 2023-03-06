const store = require('../store');

module.exports = socket => {
    socket.emit('list-status', { online: store.online, busy: store.busy, away: store.away, available: store.available });
};
