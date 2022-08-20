// This file is to connect to the database(MongoDB)

const mongoose = require('mongoose');

const mongoURI = 'mongodb://localhost:27017/portfolio-db';

const connectToMongo = () => {
    mongoose.connect(mongoURI, () => {
        console.log('Connected to MongoDB');
    });
}

module.exports = connectToMongo;