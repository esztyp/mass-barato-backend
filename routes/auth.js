const express = require('express');
const router = express.Router();
const {
  login,
  perfil,
  registrar,
  listarUsuarios,
  actualizarUsuario,
  eliminarUsuario,
} = require('../controllers/authController');
const { protegerRuta, soloRoles } = require('../middleware/auth');

// Público
router.post('/login', login);

// Requiere sesión iniciada
router.get('/me', protegerRuta, perfil);

// Solo administradores pueden gestionar usuarios
router.post('/registrar', protegerRuta, soloRoles('administrador'), registrar);
router.get('/usuarios', protegerRuta, soloRoles('administrador'), listarUsuarios);
router.put('/usuarios/:id', protegerRuta, soloRoles('administrador'), actualizarUsuario);
router.delete('/usuarios/:id', protegerRuta, soloRoles('administrador'), eliminarUsuario);

module.exports = router;
