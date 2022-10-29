const mongoose = require('mongoose');

const CertificateSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    compName: {
        type: String,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    field: {
        type: String,
        required: true
    },
    img: {
        data: Buffer,
        contentType: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    winner: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('Certificate', CertificateSchema);