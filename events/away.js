const store = require("../store");

module.exports = (socket) => {
  const { id } = socket.decoded_token;
  if (store.online.includes(id))
    store.online.splice(store.online.indexOf(id), 1);
  if (store.busy.includes(id)) store.busy.splice(store.busy.indexOf(id), 1);
  if (!store.away.includes(id)) store.away.push(id);
  store.io.emit("away", id);
};
