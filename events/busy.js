const store = require('../store');

module.exports = socket => {
    const { id } = socket.decoded_token;
    if (store.online.includes(id)) store.online.splice(store.online.indexOf(id), 1);
    if (store.away.includes(id)) store.away.splice(store.away.indexOf(id), 1);
    if (!store.busy.includes(id)) store.busy.push(id);
    store.io.emit('busy', id);
};
