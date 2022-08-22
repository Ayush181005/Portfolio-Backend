const express = require('express');
const Portfolio = require('../models/portfolio');
const { body, validationResult } = require('express-validator');
const fetchUser = require('../middleware/fetchUser');
const User = require('../models/User');

const router = express.Router();

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

// ROUTE 2:-
// Add a new portfolio using: POST "/api/portfolios/addportfolio"
router.post('/addportfolio', fetchUser, [
    // Validations for creating portfolio, using express-validator
    body('title', 'Title is required & minimum 5 characters').isLength({ min: 5 }).notEmpty(),
    body('desc', 'Minimum 20 characters').isLength({ min: 20 })
], async (req, res) => {
    // If there are errors, return the Bad Request status code with the errors, using express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    // Checking if the current user is superuser
    const currentUser = await User.findById(req.user.id);
    if (currentUser.type !== 'superuser') return res.status(401).json({errors: [{msg: 'Access denied!'}]});

    try {
        // Saving Portfolio
        const { title, desc, type, slug, links } = req.body;

        const portfolio = new Portfolio({
            title,
            desc,
            type,
            slug,
            links,
            user: req.user.id
        });
        const savedPortfolio = await portfolio.save();

        res.json(savedPortfolio);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Something went wrong...');
    }
});

// ROUTE 3:-
// Update Portfolio using: PUT "/api/portfolios/updateportfolio/:id"
router.put('/updateportfolio/:id', fetchUser, async (req, res) => {
    // Checking if the current user is superuser
    const currentUser = await User.findById(req.user.id);
    if (currentUser.type !== 'superuser') return res.status(401).json({errors: [{msg: 'Access denied!'}]});

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
        if (!portfolio) return res.status(404).json({errors: [{msg: 'Not Found'}]});
        if (portfolio.user.toString() !== req.user.id) return res.status(401).json({errors: [{msg: 'Access denied!'}]});

        // Update note
        portfolio = await Portfolio.findByIdAndUpdate(req.params.id, {$set: updatedPortfolio}, {new: true});
        res.json(portfolio);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Something went wrong...');
    }
});

// ROUTE 4:-
// Delete Portfolio using: DELETE "/api/portfolios/deleteportfolio/:id"
router.delete('/deleteportfolio/:id', fetchUser, async (req, res) => {
    // Checking if the current user is superuser
    const currentUser = await User.findById(req.user.id);
    if (currentUser.type !== 'superuser') return res.status(401).json({errors: [{msg: 'Access denied!'}]});

    try {
        // Deleting Portfolio
        // Finding portfolio to be deleted
        let portfolio = await Portfolio.findById(req.params.id);
        if (!portfolio) return res.status(404).json({errors: [{msg: 'Not Found'}]});
        if (portfolio.user.toString() !== req.user.id) return res.status(401).json({errors: [{msg: 'Access denied!'}]});

        // Delete portfolio
        portfolio = await Portfolio.findByIdAndDelete(req.params.id);

        res.json({success: [{msg: 'Portfolio Deleted Succesfullt!'}, {portfolio}]});
        
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Something went wrong...');
    }
});

module.exports = router;