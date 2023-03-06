var jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
    // var token = req.headers['x-access-token'];
    console.log('very');
    var token = req.headers.authorization;
    console.log(token);
    console.log('verify');
    if (!token)
        return res.status(403).send({ auth: false, message: 'No token provided.' });
    if (req.params.id == 'google' || req.params.id =='facebook') {
        console.log('google/facebook verify');
        if(req.params.id == 'google')
            req.logtype = 1;
        else
            req.logtype = 2;
        req.providerId = token;
        next();
    } 
    else{
        jwt.verify(token, process.env.JWT_SECRET, function(err, decoded) {
            if (err)
                return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });

            // if everything good, save to request for use in other routes
            req.userId = decoded._id;
            req.logtype = decoded.logtype;
            console.log(req.userId)
            console.log(req.logtype)
            next();
        });
    }
}

module.exports = verifyToken;