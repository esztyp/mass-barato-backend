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
const { protegerRuta, soloRoles } = require('../middleware/auth');

// Todas las rutas de productos requieren haber iniciado sesión
router.use(protegerRuta);

router.get('/alertas/bajos', getAlertas);
router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', soloRoles('administrador'), deleteProduct);
router.post('/:id/movimiento', registerMovement);

module.exports = router;
