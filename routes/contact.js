const express = require('express');
const Contact = require('../models/Contact');
const { body, validationResult } = require('express-validator');
const fetchUser = require('../middleware/fetchUser');
const User = require('../models/User');

const router = express.Router();

// ROUTE 1:-
// Add Contact using: POST "/api/contacts/addcontact"
router.post('/addcontact', [
    body('name', 'Name is required').notEmpty(),
    body('email', 'Email is required').notEmpty().isEmail(),
    body('msg', 'Message is required').notEmpty()
], async (req, res) => {
    let success = false;

    // If there are errors, return the Bad Request status code with the errors, using express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array(), success });
    }

    try {
        const { name, email, msg } = req.body;

        const contact = new Contact({name, email, msg});
        const savedContact = await contact.save();
        success = true;
        res.json({contact:savedContact, success});
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Something went wrong...');
    }
});

// ROUTE 2:-
// Get all Contacts using: POST "/api/contacts/getcontacts"
router.post('/getcontacts', fetchUser, async (req, res) => {
    try {
        const myPortfolios = await Contact.find()
        res.json(myPortfolios);

        // Checking if the current user is superuser
        const currentUser = await User.findById(req.user.id);
        if (currentUser.type !== 'superuser') return res.status(401).json({errors: [{msg: 'Access denied!'}], success});
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Something went wrong...');
    }
});

module.exports = router;