const express = require('express');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const config = require('config');
const jwt = require('jsonwebtoken');
const fetchUser = require('../middleware/fetchUser');

const router = express.Router();

const JWT_SECRET = config.get('JWT_SECRET');


// ROUTE 1:-
// Create a User using: POST "/api/auth/signup"
router.post('/signup', [
    // Validations for creating user, using express-validator
    body('name', 'Enter a name with atleast 3 letters').isLength({ min: 3 }).notEmpty(),
    body('email', 'Invalid Email').isEmail().notEmpty(),
    body('password', 'Enter an alphanumeric password of atleast 7 letters').isLength({ min: 7 }).isAlphanumeric().notEmpty()
], async (req, res) => {
    // If there are errors, return the Bad Request status code with the errors, using express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        // Check whether the user with this email already exists
        let user = await User.findOne({ email: req.body.email });
        if (user) {
            return res.status(400).json({errors: [{msg: 'User already exists'}]});
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
        const authToken = jwt.sign(data, JWT_SECRET)
        res.json({authToken});
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
    // If there are errors, return the Bad Request status code with the errors, using express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({errors: [{msg: 'Invalid Credentials'}]});
        }

        // Using bcrypt to compare the password with the hashed password in the database
        const passwordCompare = await bcrypt.compare(password, user.password); // returns a boolean
        if (!passwordCompare) {
            return res.status(400).json({errors: [{msg: 'Invalid Credentials'}]});
        }

        const data = { // this data is also called payload in JWT
            user: {
                id: user.id
            }
        }

        const authToken = jwt.sign(data, JWT_SECRET)
        res.json({authToken});
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
        res.json(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Something went wrong...');
    }
});


module.exports = router;