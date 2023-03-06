// const Message = require('../models/Message');
// const Room = require('../models/Room');
var mongoose = require('mongoose');
const Room = mongoose.model('rooms');
const Message = mongoose.model('messages');
const store = require('../store');
const xss = require('xss');
const Client = mongoose.model('Client');
const Nurse = mongoose.model('Nurse');
var Config = require('../config/config');
const nodemailer = require('nodemailer'); 

module.exports =  (socket, data) => {

    // console.log('message lates',data)
    console.log(`Received message event: ${JSON.stringify(data)}`);

    const { roomID, clientID, nurseID, content, type } = data;
  
    Message({
        room: roomID,
        // author: authorID,
        authorClient: clientID || null,
        authorNurse: nurseID || null,
        content: xss(content),
        type:'text',
    }).save()
        .then(message => {

            console.log('-- save msg --', message.content)
           
         
           
            if(message.authorClient!=null){
                Room.findOne({_id: message.room }).then((result) => {
                    // console.log('-- Roomresult --', result.peopleNurse)

                    Nurse.findOne({_id: result.peopleNurse }).then((result1) => {
                                console.log('--nurses result --', result1.firstName)
                                var transporter = nodemailer.createTransport({
                                    // host: 'smtp.gmail.com',
                                    // port: 465,
                                    // ignoreTLS: false,
                                    // secure: true,

                                    host: "smtp.gmail.com",
                                    secureConnection: false,
                                    port: 587,
                                    requiresAuth: true,
                                    domains: ["gmail.com", "googlemail.com"],
                                    auth: {
                                        user: Config.email,
                                        pass: Config.password
                                    }
                                    // tls: {
                                    //     rejectUnauthorized: true
                                    // }

                                })
                    
                             console.log('transporter',transporter);
                                var mailOptions = {
                                    from: 'praecuroapp@gmail.com',
                                    to: result1.email,
                                    subject: result1.firstName,
                                    html: `<p>${message.content}</p>`,
                                };

                              transporter.sendMail(mailOptions, function(error, info){
                                    // console.log('Email sent: ' + info);
                                    if (error) {
                                        console.log('Email send failed:',error);
                                    } else {
                                        console.log('Email sent: ' + info.response);
                                    }
                                }); 

                            })
                  
                })
            }
    
            else if(message.authorNurse!=null){
                Room.findOne({_id: message.room }).then((result) => {
                    // console.log('--room111 result --', result.peopleClient)
                    Client.findOne({_id: result.peopleClient }).then((result1) => {
                        console.log('--clie result --', result1.email)
                        
                        var transporter = nodemailer.createTransport({
                            // host: 'smtp.gmail.com',
                            // port: 465,
                            // ignoreTLS: false,
                            // secure: true,

                            host: "smtp.gmail.com",
                            secureConnection: false,
                            port: 587,
                            requiresAuth: true,
                            domains: ["gmail.com", "googlemail.com"],
                            auth: {
                                user: Config.email,
                                pass: Config.password
                            }
                            // tls: {
                            //     rejectUnauthorized: true
                            // }

                        })

                        var mailOptions = {
                            from: 'praecuroapp@gmail.com',
                            to: result1.email,
                            subject: result1.firstName,
                        
                            html: `<p>${message.content}</p>`,
                        };

                        transporter.sendMail(mailOptions, function(error, info){
                            
                            if (error) {
                                console.log('Email send failed:',error);
                            } else {
                                console.log('Email sent: ' + info.response);
                            }
                        }); 

                    })
                })

            }


          
          
           




            // 60855c6ec11ed23de8b9f4f5
            // Message.findById(message._id).populate({
            //     path: 'author',
            //     select: '-email -password -friends -__v',
            //     populate: {
            //         path: 'picture',
            //     },
            // }).then(message => {
                Room.findByIdAndUpdate(roomID, { $set: { lastUpdate: message.date, lastMessage: message._id, lastClient: clientID || null , lastNurse: nurseID || null } })
                    .then(room => {
                        
                        socket.emit('message-out', {status: 200, message, room});
                            const myUserID = socket.decoded_token.id;
                            const personClientID = room.peopleClient.toString();
                            const personNurseID = room.peopleNurse.toString();
                            if (personClientID !== myUserID && store.socketsByUserID[personClientID]) {
                                store.socketsByUserID[personClientID].forEach(socket => {
                                    store.io.to(socket.id).emit('message-in', {status: 200, message, room});
                                });
                            }
                            if (personNurseID !== myUserID && store.socketsByUserID[personNurseID]) {
                                store.socketsByUserID[personNurseID].forEach(socket => {
                                    store.io.to(socket.id).emit('message-in', {status: 200, message, room});
                                });
                            }
                    })
                    .catch(err => {
                        console.log('vcccc',err);
                        socket.emit('message-out', {status: 500, message});
                    });
            // })
            //     .catch(err => {
            //         console.log(err);
            //         socket.emit('message-out', {status: 500, message});
            //     });
        })
        .catch(err => {
            console.log('-- s111ave msg --', err)
            console.log(err);
            socket.emit('message-out', {status: 500});
        });
};
