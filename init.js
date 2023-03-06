const store = require('./store');
const events = require('./events');
const socketioJwt   = require('socketio-jwt');
const cors = require('cors');
const router = require('./routes');
const formidableMiddleware = require('express-formidable');
const mongoose = require('mongoose');
const User = require('./models/User');
const argon2i = require('argon2-ffi').argon2i;
const crypto = require('crypto');
const Promise = require('bluebird');
const randomBytes = Promise.promisify(crypto.randomBytes);
const passport = require('passport');
const fs = require('fs');
const {Strategy, ExtractJwt} = require('passport-jwt');

module.exports = () => {
    store.io.sockets
        .on('connection', socketioJwt.authorize({
            secret: store.config.secret,
            timeout: 15000 // 15 seconds to send the authentication message
        }))
        .on('authenticated', socket => {
            const { email, id } = socket.decoded_token;
            console.log(`Socket connected: ${email}`.cyan);

            events.forEach(event => socket.on(event.tag, data => event.callback(socket, data)));

            store.socketIds.push(socket.id);
            store.sockets[socket.id] = socket;

            if (!store.socketsByUserID[id]) store.socketsByUserID[id] = [];
            store.socketsByUserID[id].push(socket);
            store.userIDsBySocketID[socket.id] = id;

            socket.on('unauthorized', (error, callback) => {
                console.log('Unauthorized user attempt.');
                if (error.data.type === 'UnauthorizedError' || error.data.code === 'invalid_token') {
                    // redirect user to login page perhaps or execute callback:
                    callback();
                    console.log('User token has expired');
                }
            });

            const removeSocket = (array, element) => {
                let result = [...array];
                let i = 0;
                let found = false;
                while (i < result.length && !found) {
                    if (element.id === array[i].id) {
                        result.splice(i, 1);
                        found = true;
                    }
                    i++;
                }
                return result;
            };

            socket.on('disconnect', () => {
                console.log(`Socket disconnected: ${email}`.cyan);
                store.socketIds.splice(store.socketIds.indexOf(socket.id), 1);
                store.sockets[socket.id] = undefined;
                store.socketsByUserID[id] = removeSocket(store.socketsByUserID[id], socket);
                if (store.online.includes(store.userIDsBySocketID[socket.id])) store.online.splice(store.online.indexOf(store.userIDsBySocketID[socket.id]), 1);
                if (store.busy.includes(store.userIDsBySocketID[socket.id])) store.busy.splice(store.busy.indexOf(store.userIDsBySocketID[socket.id]), 1);
                if (store.away.includes(store.userIDsBySocketID[socket.id])) store.away.splice(store.away.indexOf(store.userIDsBySocketID[socket.id]), 1);
                if (store.available.includes(store.userIDsBySocketID[socket.id])) store.available.splice(store.available.indexOf(store.userIDsBySocketID[socket.id]), 1);
                store.io.emit('offline', store.userIDsBySocketID[socket.id]);
            });
        });

    store.app.use(cors());
    store.app.use(formidableMiddleware());
    store.app.use(passport.initialize());
    passport.use('jwt', new Strategy({
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: store.config.secret,
    }, (payload, done) => {
        User.findById(payload.id)
            .then(user => {
                if (user) return done(null, user);
                return done(null, false);
            })
            .catch(err => console.log(err));
    }));
    store.app.use('/api', router);

    mongoose.set('useCreateIndex', true);
    const mongooseConnect = () => {
        let connecting = setTimeout(() => console.log('Connecting to DB...'.yellow), 1000);
        mongoose.connect(store.config.db, {useNewUrlParser: true, useFindAndModify: false, useUnifiedTopology: true})
            .then(() => {
                clearTimeout(connecting);
                const {username, email, password, firstName, lastName} = store.config.admin;
                User.findOne({email})
                    .then(user => {
                        if (!user) randomBytes(32).then(salt => argon2i.hash(password, salt))
                            .then(hash => new User({username, email, password: hash, firstName, lastName, level: 'root'}).save());
                        else randomBytes(32).then(salt => argon2i.hash(password, salt))
                            .then(hash => User.findOneAndUpdate({email},{ $set: {username, email, password: hash, firstName, lastName, level: 'root'}}));
                    });

                console.log('Connected to DB'.green);
                store.connected = true;
            })
            .catch(() => {
                clearTimeout(connecting);
                console.log('Unable to connect to DB'.red);
                console.log('Retrying in 10 seconds'.yellow);
                setTimeout(mongooseConnect, 10 * 1000);
            });
    };
    mongooseConnect();
};
