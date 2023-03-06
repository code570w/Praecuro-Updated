const store = require("../store");

module.exports = (socket) => {
  const { id } = socket.decoded_token;
  if (!store.available.includes(id)) store.available.push(id);
  store.io.emit("available", id);
};
