const express = require('express');
const Portfolio = require('../models/Portfolio');
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
        cb(null, 'uploads/portfolio')
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname+imgSuffix+'.'+file.originalname.split('.').pop())
    }
});
const upload = multer({ storage });

// ROUTE 1:-
// Get all portfolios using: POST "/api/portfolios/getportfolios"
router.post('/getportfolios', async (req, res) => {
    try {
        const myPortfolios = await Portfolio.find()
        res.json(myPortfolios);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Something went wrong...');
    }
});

// ROUTE 5:-
// Get a portfolio using slug: GET "/api/portfolios/getportfolio/:slug"
router.get('/getportfolio/:slug', async (req, res) => {
    try {
        const myPortfolio = await Portfolio.findOne({slug: req.params.slug});

        if(!myPortfolio) {
            return res.status(404).json({msg: 'Portfolio not found'});
        }

        res.json(myPortfolio);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Something went wrong...');
    }
});

// ROUTE 5:-
// Get a portfolio using slug: GET "/api/portfolios/getportfolio/:slug"
router.get('/getportfoliofromid/:id', async (req, res) => {
    try {
        const myPortfolio = await Portfolio.findById(req.params.id);

        if(!myPortfolio) {
            return res.status(404).json({msg: 'Portfolio not found'});
        }

        res.json(myPortfolio);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Something went wrong...');
    }
});

// ROUTE 2:-
// Add a new portfolio using: POST "/api/portfolios/addportfolio"
router.post('/addportfolio', fetchUser, upload.single('image'), [
    // Validations for creating portfolio, using express-validator
    body('title', 'Title is required & minimum 5 characters').isLength({ min: 5 }).notEmpty()
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
        // Saving Portfolio
        const { title, desc, type, slug, links } = req.body;
        const portfolio = new Portfolio({
            title,
            desc,
            type,
            slug,
            links,
            user: req.user.id,
            img: req.file ? {
                data: fs.readFileSync(path.join(__dirname, '..', 'uploads', 'portfolio', req.file.filename)),
                contentType: 'image/*'
            } : null
        });
        const savedPortfolio = await portfolio.save();
        success = true;
        res.json({portfolio:savedPortfolio, success});
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Something went wrong...');
    }
});

// ROUTE 3:-
// Update Portfolio using: PUT "/api/portfolios/updateportfolio/:id"
router.put('/updateportfolio/:id', fetchUser, async (req, res) => {
    let success = false;
    // Checking if the current user is superuser
    const currentUser = await User.findById(req.user.id);
    if (currentUser.type !== 'superuser') return res.status(401).json({errors: [{msg: 'Access denied!'}], success});

    try {
        // Updating Portfolio
        const { title, desc, type, slug, links } = req.body;

        const updatedPortfolio = {};

        // Changing details if they are not empty
        title ? updatedPortfolio.title = title : null;
        desc ? updatedPortfolio.desc = desc : null;
        type ? updatedPortfolio.type = type : null;
        slug ? updatedPortfolio.slug = slug : null;
        links ? updatedPortfolio.links = links : null;

        // Find note to be updated
        let portfolio = await Portfolio.findById(req.params.id);
        if (!portfolio) return res.status(404).json({errors: [{msg: 'Not Found'}], success});
        if (portfolio.user.toString() !== req.user.id) return res.status(401).json({errors: [{msg: 'Access denied!'}], success});

        // Update note
        portfolio = await Portfolio.findByIdAndUpdate(req.params.id, {$set: updatedPortfolio}, {new: true});
        success = true;
        res.json({portfolio, success});
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Something went wrong...');
    }
});

// ROUTE 4:-
// Delete Portfolio using: DELETE "/api/portfolios/deleteportfolio/:id"
router.delete('/deleteportfolio/:id', fetchUser, async (req, res) => {
    let success = false;
    // Checking if the current user is superuser
    const currentUser = await User.findById(req.user.id);
    if (currentUser.type !== 'superuser') return res.status(401).json({errors: [{msg: 'Access denied!'}], success});

    try {
        // Deleting Portfolio
        // Finding portfolio to be deleted
        let portfolio = await Portfolio.findById(req.params.id);
        if (!portfolio) return res.status(404).json({errors: [{msg: 'Not Found'}], success});
        if (portfolio.user.toString() !== req.user.id) return res.status(401).json({errors: [{msg: 'Access denied!'}], success});

        // Delete portfolio
        deletedPortfolio = await Portfolio.findByIdAndDelete(req.params.id);
        success = true;
        res.json({portfolio: deletedPortfolio, success});
        
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Something went wrong...');
    }
});

module.exports = router;