const mongoose = require('mongoose');

const PortfolioSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    title: {
        type: String,
        required: true
    },
    img: {
        data: Buffer,
        contentType: String
    },
    desc: String,
    type: String,
    slug: String,
    date: {
        type: Date,
        default: Date.now
    },
    links: String // will be seperated by comma and space ', '
});

module.exports = mongoose.model('Portfolio', PortfolioSchema);