require('dotenv').config(); //let us to use env variables
const express = require('express');
const app = express();
const path = require('path');
const { logger, logEvents } = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const connectDB = require('./config/dbConn');
const mongoose = require('mongoose');
const PORT = process.env.PORT || 3500;

connectDB()

app.use(logger)

app.use(cors(corsOptions))

app.use(express.json()) //allows us to parse json

app.use(cookieParser()) //allows us to parse cookies

app.use('/', express.static(path.join(__dirname, 'public')))

app.use('/', require('./routes/root'))

app.use('/auth', require('./routes/authRoutes'))
app.use('/users', require('./routes/userRoutes'))
app.use('/notes', require('./routes/noteRoutes'))

app.all('*', (req, res) => {
    res.status(404);
    
    if(req.accepts('.html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'))
    }
    else if(req.accepts('.json')) {
        res.json({ message : '404 Not Found'})
    }
    else {
        res.type('txt').send('404 Not Found')
    }
})

app.use(errorHandler);

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));
})

mongoose.connection.on('error', err => {
    console.log(err);
    logEvents(`${err.no}: ${err.code}\t ${err.syscall}\t ${err.hostname}`, 'mongoErrLog.log')
})
/*
    pswd: hfMCz8YhMpZ40vcL
    connection string: mongodb+srv://harshithteja:hfMCz8YhMpZ40vcL@cluster0.yguhcrb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
    connection string: mongodb+srv://harshithteja:<password>@cluster0.yguhcrb.mongodb.net/
*/