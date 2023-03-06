var room = require("../controllers/Room.controller");

module.exports = (app) => {
    app.post('/room/add', room.addPayment)
    app.post('/room/token', room.createToken)
    app.post('/room/create', room.createCustomer)
    app.post('/room/verify', room.verifySource)
    app.post('/room/charge', room.createCharge)
};
