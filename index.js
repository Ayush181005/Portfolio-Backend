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
app.use(cors({origin: '*'})); // middleware for allowing cross-origin requests

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