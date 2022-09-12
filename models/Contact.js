const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    msg: {
        type: String,
        required: true
    },
    timeStamp: {
        type: Date,
        default: Date.now
    },
});

module.exports = mongoose.model('Contact', ContactSchema);