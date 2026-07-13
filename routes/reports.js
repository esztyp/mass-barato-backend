const express = require('express');
const router = express.Router();
const {
  exportarProductosExcel,
  exportarMovimientosExcel,
} = require('../controllers/reportController');
const { protegerRuta } = require('../middleware/auth');

router.get('/productos/excel', protegerRuta, exportarProductosExcel);
router.get('/movimientos/excel', protegerRuta, exportarMovimientosExcel);

module.exports = router;
