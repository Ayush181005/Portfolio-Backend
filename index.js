// login for uploading or dleting or editing certificates/portfolios
const connectToMongo = require('./db');
const express = require('express');
const cors = require('cors');
const config = require('config');

connectToMongo();

const app = express();
const host = config.get('server.host');
const port = config.get('server.port');

app.use(express.json()); // middleware for parsing application/json in req.body
app.use(cors()); // middleware for allowing cross-origin requests

// Available routes
app.use('/api/auth/', (require('./routes/auth')));
app.use('/api/portfolios/', (require('./routes/portfolio')));
app.use('/api/certificates/', (require('./routes/certificate')));
app.use('/api/contacts/', (require('./routes/contact')));

app.listen(port, () => {
    console.log(`Listening at http://${host}:${port}`);
});