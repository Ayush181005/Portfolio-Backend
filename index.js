// login for uploading or dleting or editing certificates/portfolios
const connectToMongo = require('./db');
const express = require('express');
const config = require('config');

connectToMongo();

const app = express();
const host = config.get('server.host');
const port = config.get('server.port');

app.use(express.json()); // middleware for parsing application/json in req.body

// Available routes
app.use('/api/auth/', (require('./routes/auth')));

app.listen(port, () => {
    console.log(`Listening at http://${host}:${port}`);
});