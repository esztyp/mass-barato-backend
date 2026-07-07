const express = require('express');
const router = express.Router();
const { getMovements } = require('../controllers/movementController');

router.get('/', getMovements);

module.exports = router;
