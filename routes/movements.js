const express = require('express');
const router = express.Router();
const { getMovements } = require('../controllers/movementController');
const { protegerRuta } = require('../middleware/auth');

router.get('/', protegerRuta, getMovements);

module.exports = router;
