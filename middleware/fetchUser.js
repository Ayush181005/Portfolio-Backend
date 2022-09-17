const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config(); // To get the environment variables

const JWT_SECRET = process.env.JWT_SECRET;

const fetchUser = (req, res, next) => {
    // Get the user from jwtToken and add id to req object
    const token = req.header('auth-token');

    if (!token) {
        res.status(401).json({errors: [{msg: 'Access denied!'}]});
    }

    try {
        const data = jwt.verify(token, JWT_SECRET);
        req.user = data.user;

        next(); // So that next middleware is called
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Something went wrong...');
    }
}

module.exports = fetchUser;