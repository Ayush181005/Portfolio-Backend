const express = require('express');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchUser = require('../middleware/fetchUser');
const fetch = require('node-fetch');
const dotenv = require('dotenv');

dotenv.config(); // To get the environment variables
const router = express.Router(); // To create a router

const JWT_SECRET = process.env.JWT_SECRET;

// ROUTE 1:-
// Create a User using: POST "/api/auth/signup"
router.post('/signup', [
    // Validations for creating user, using express-validator
    body('name', 'Enter a name with atleast 3 letters').isLength({ min: 3 }).notEmpty(),
    body('email', 'Invalid Email').isEmail().notEmpty(),
    body('password', 'Enter a password of atleast 5 letters').isLength({ min: 5 }).notEmpty()
], async (req, res) => {
    let success = false;
    // If there are errors, return the Bad Request status code with the errors, using express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array(), success });
    }

    try {
        // ReCaptcha validation
        const recaptchaToken = req.body.recaptchaToken;
        const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
        const recaptchaResponse = await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecret}&response=${recaptchaToken}`, {method:'POST'});
        const recaptchaData = await recaptchaResponse.json();
        if (!recaptchaData.success) return res.status(400).json({ errors: [{msg: "Please ensure that you are not a bot"}], success: false });
        // Check whether the user with this email already exists
        let user = await User.findOne({ email: req.body.email });
        if (user) {
            return res.status(400).json({errors: [{msg: 'User already exists'}], success});
        }

        // Securing the password using bcrypt, hashing, adding salt and pepper
        const salt = await bcrypt.genSalt(10);
        const securePassword = await bcrypt.hash(req.body.password, salt);

        // Creating User if no errors
        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: securePassword
        });

        // We'll send the JSON Web Token (JWT) to the client
        const data = {
            user: {
                id: user.id
            }
        }
        const authToken = jwt.sign(data, JWT_SECRET);
        success = true;
        res.json({authToken, success});
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Something went wrong...');
    }
});

// ROUTE 2:-
// Login a User (Authenticate a user) using: POST "/api/auth/login"
router.post('/login', [
    // Validations for logging in a user, using express-validator
    body('email', 'Invalid Email').isEmail().notEmpty(),
    body('password', 'Password is required').notEmpty()
], async (req, res) => {
    let success = false;

    // If there are errors, return the Bad Request status code with the errors, using express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array(), success });
    }

    const { email, password, recaptchaToken } = req.body;
    try {
        // ReCaptcha validation
        const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
        const recaptchaResponse = await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecret}&response=${recaptchaToken}`, {method:'POST'});
        const recaptchaData = await recaptchaResponse.json();
        if (!recaptchaData.success) return res.status(400).json({ errors: [{msg: "Please ensure that you are not a bot"}], success: false });

        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({errors: [{msg: 'Invalid Credentials'}], success});
        }

        // Using bcrypt to compare the password with the hashed password in the database
        const passwordCompare = await bcrypt.compare(password, user.password); // returns a boolean
        if (!passwordCompare) {
            return res.status(400).json({errors: [{msg: 'Invalid Credentials'}], success});
        }

        const data = { // this data is also called payload in JWT
            user: {
                id: user.id
            }
        }

        const authToken = jwt.sign(data, JWT_SECRET);
        success = true;
        res.json({authToken, success});
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Something went wrong...');
    }
});

// ROUTE 3:-
// Get logged in User details using: POST "/api/auth/getuser"
router.post('/getuser', fetchUser, async (req, res) => {
    // Here, we'll use middleware to check if the user is logged in and get authtoken
    // The middleware, fetchUser, checks using auth-token in header and validates it and appends user details in request(req) object
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select('-password');
        res.json({user, success:true});
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Something went wrong...');
    }
});

// ROUTE 4:-
// Get data of all users using: POST "/api/auth/getusers"
router.post('/getusers', fetchUser, async (req, res) => {
    try {
        const myUsers = await User.find()
        res.json(myUsers);

        // Checking if the current user is superuser
        const currentUser = await User.findById(req.user.id);
        if (currentUser.type !== 'superuser') return res.status(401).json({errors: [{msg: 'Access denied!'}], success});
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Something went wrong...');
    }
});

// ROUTE 5:-
// Delete User using: DELETE "/api/auth/deleteuser/:id"
router.delete('/deleteuser/:id', fetchUser, async (req, res) => {
    let success = false;
    // Checking if the current user is superuser
    const currentUser = await User.findById(req.user.id);
    if (currentUser.type !== 'superuser') return res.status(401).json({errors: [{msg: 'Access denied!'}], success});

    try {
        // Deleting User
        // Finding user to be deleted
        let user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({errors: [{msg: 'Not Found'}], success});

        // Delete contact
        deletedUser = await User.findByIdAndDelete(req.params.id);
        success = true;
        res.json({user: deletedUser, success});
        
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Something went wrong...');
    }
});


module.exports = router;