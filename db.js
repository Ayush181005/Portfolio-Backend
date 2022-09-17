// This file is to connect to the database(MongoDB)
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config(); // To get the environment variables

const mongoURI = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@cluster0.ezmvoas.mongodb.net/${process.env.MONGODB_DB}?retryWrites=true&w=majority`; // All parameters should be url encoded
// const mongoURI = 'mongodb://localhost:27017/portfolio-db';

const connectToMongo = () => {
    mongoose.connect(mongoURI, (error, result) => {
        console.log('Connected to MongoDB' + '\nError: ' + error);
    });
}

module.exports = connectToMongo;