const allowedOrigins = require('./allowedOrigins')

const corsOptions = {
    origin: (origin, callback) => {
        if(allowedOrigins.indexOf(origin) !== -1 || !origin) { //!origin - allows sites like postman to work on the backend
            callback(null, true)
        } 
        else {
            callback(new Error('Not allowd by CORS'))
        }
    },
    credentials: true, //set access control allow credentials to true
    optionsSuccessStatus: 200
}

module.exports = corsOptions

