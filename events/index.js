// console.log('hiiigoogle');

module.exports = [
    {
        tag: 'message',
        callback: require('./message'),
    },

    {
        tag: 'create-room',
        callback: require('./create-room'),
    },

    {
        tag: 'list-rooms',
        callback: require('./list-rooms'),
    },
    {
        tag: 'join-room',
        callback: require('./join-room'),
    },
    {
        tag: 'more-messages',
        callback: require('./more-messages'),
    },
    
    {
        tag: 'more-rooms',
        callback: require('./more-rooms'),
    },
    {
        tag: 'close',
        callback: require('./close'),
    },
    {
        tag: 'away',
        callback: require('./away'),
    },
    {
        tag: 'busy',
        callback: require('./busy'),
    },
    {
        tag: 'online',
        callback: require('./online'),
    },
    {
        tag: 'available',
        callback: require('./available'),
    },
    {
        tag: 'list-status',
        callback: require('./list-status'),
    }
    // {
    //     tag: 'search',
    //     callback: require('./search'),
    // },
];
