const store = require('../store');

module.exports = socket => {
    const { id } = socket.decoded_token;
    if (store.busy.includes(id)) store.busy.splice(store.busy.indexOf(id), 1);
    if (store.away.includes(id)) store.away.splice(store.away.indexOf(id), 1);
    if (!store.online.includes(id)) store.online.push(id);
    store.io.emit('online', id);
};
