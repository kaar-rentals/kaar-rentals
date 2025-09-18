// backend/routes/cars.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const ensureMembership = require('../middleware/ensureMembership');
const { getCars, addCar } = require('../controllers/carController');

router.get('/', getCars);

// Only logged-in owners (with active membership) can post
router.post('/', auth(['owner','admin']), ensureMembership, addCar);

module.exports = router;
