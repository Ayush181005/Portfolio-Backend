// login for uploading or dleting or editing certificates/portfolios
const connectToMongo = require('./db');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// const portfolioRoutes = require('./routes/portfolio');

dotenv.config(); // To get the environment variables
connectToMongo(); // To connect to the database

const app = express();
// const host = process.env.HOST; // development
const port = process.env.PORT || 3000;

app.use(express.json()); // middleware for parsing application/json in req.body
app.use(cors()); // middleware for allowing cross-origin requests
// Add headers before the routes are defined
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'https://www.theayush.in');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

// Checking the server
app.get('/', (req, res) => {
    res.send("Hello, World. The app is running!");
});

// Available routes
app.use('/api/auth/', require('./routes/auth'));
app.use('/api/portfolios/', require('./routes/portfolio'));
app.use('/api/certificates/', require('./routes/certificate'));
app.use('/api/contacts/', require('./routes/contact'));

app.listen(port, () => {
    console.log(`Listening at port ${port}`); // production
    // console.log(`Listening at http://${host}:${port}`); // development
});