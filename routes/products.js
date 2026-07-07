const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  registerMovement,
  getAlertas,
} = require('../controllers/productController');

router.get('/alertas/bajos', getAlertas);
router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);
router.post('/:id/movimiento', registerMovement);

module.exports = router;
