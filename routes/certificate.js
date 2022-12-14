const express = require('express');
const Certificate = require('../models/Certificate');
const { body, validationResult } = require('express-validator');
const fetchUser = require('../middleware/fetchUser');
const User = require('../models/User');
const multer  = require('multer');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const imgSuffix = Date.now() + '-' + Math.round(Math.random()*1E9)
// multer config for image upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/certificates')
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname+imgSuffix+'.'+file.originalname.split('.').pop())
    }
});
const upload = multer({ storage });

// ROUTE 1:-
// Get all certificates using: POST "/api/certificates/getcertificates"
router.post('/getcertificates', async (req, res) => {
    try {
        const myCertificates = await Certificate.find()
        res.json(myCertificates);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Something went wrong...');
    }
});

// ROUTE 2:-
// Add a new certificate using: POST "/api/certificates/addcertificate"
router.post('/addcertificate', fetchUser, upload.single('image'), [
    // Validations for creating certificate, using express-validator
    body('compName', 'Name of Competition is required & minimum 5 characters').isLength({ min: 5 }).notEmpty()
], async (req, res) => {
    let success = false;
    // If there are errors, return the Bad Request status code with the errors, using express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array(), success });
    }

    // Checking if the current user is superuser
    const currentUser = await User.findById(req.user.id);
    if (currentUser.type !== 'superuser') return res.status(401).json({errors: [{msg: 'Access denied!'}], success});

    try {
        // Saving Certificate
        const { compName, year, field, winner } = req.body;
        const certificate = new Certificate({
            compName,
            year,
            field,
            winner,
            user: req.user.id,
            img: req.file ? {
                data: fs.readFileSync(path.join(__dirname, '..', 'uploads', 'certificates', req.file.filename)),
                contentType: 'image/*'
            } : null
        });
        const savedCertificate = await certificate.save();
        success = true;
        res.json({certificate:savedCertificate, success});
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Something went wrong...');
    }
});

// ROUTE 3:-
// Delete Certificate using: DELETE "/api/certificates/deletecertificate/:id"
router.delete('/deletecertificate/:id', fetchUser, async (req, res) => {
    let success = false;
    // Checking if the current user is superuser
    const currentUser = await User.findById(req.user.id);
    if (currentUser.type !== 'superuser') return res.status(401).json({errors: [{msg: 'Access denied!'}], success});

    try {
        // Deleting Certificate
        // Finding certificate to be deleted
        let certificate = await Certificate.findById(req.params.id);
        if (!certificate) return res.status(404).json({errors: [{msg: 'Not Found'}], success});
        if (certificate.user.toString() !== req.user.id) return res.status(401).json({errors: [{msg: 'Access denied!'}], success});

        // Delete certificate
        deletedCertificate = await Certificate.findByIdAndDelete(req.params.id);
        success = true;
        res.json({certificate: deletedCertificate, success});
        
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Something went wrong...');
    }
});

// ROUTE 4:-
// Get a certificate by page using: GET "/api/certificates/getsomecertificates?page=1&size=10"
router.get('/getsomecertificates', async (req, res) => {
    try {
        const page = parseInt(req.query.page);
        const size = parseInt(req.query.size);
        const query = {};
        if (page < 0 || page === 0) {
            response = { "error": true, "message": "invalid page number, should start with 1" };
            return res.json(response);
        }
        query.sort = { year: -1 };
        query.skip = size * (page - 1);
        query.limit = size;
        // Find some certificates
        const myCertificates = await Certificate.find({}, {}, query);
        // Count total number of certificates
        // const totalCertificates = await Certificate.countDocuments();
        res.json(myCertificates);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Something went wrong...');
    }
});

// ROUTE 5:-
// Get no. of total certificates using: GET "/api/certificates/getnumcertificates"
router.get('/getnumcertificates', async (req, res) => {
    try {
        // Count total number of certificates
        const totalCertificates = await Certificate.countDocuments();
        res.json(totalCertificates);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Something went wrong...');
    }
});

// ROUTE 6:-
// Get list of all fields using: GET "/api/certificates/getfields"
router.get('/getfields', async (req, res) => {
    try {
        // Get list of all fields
        const fields = await Certificate.find().distinct('field');
        res.json(fields);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Something went wrong...');
    }
});

// ROUTE 7:-
// Get certificates by field using: GET "/api/certificates/getcertificatesbyfield?field=field"
router.get('/getcertificatesbyfield', async (req, res) => {
    try {
        // Get certificates by field
        const certificates = await Certificate.find({field:req.query.field});
        res.json(certificates);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Something went wrong...');
    }
});

module.exports = router;