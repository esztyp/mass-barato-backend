const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verifica que la petición traiga un token válido (usuario ha iniciado sesión)
exports.protegerRuta = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ mensaje: 'No autorizado, falta el token de acceso' });
    }
    const token = header.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const usuario = await User.findById(payload.id);
    if (!usuario || !usuario.activo) {
      return res.status(401).json({ mensaje: 'Usuario no válido o inactivo' });
    }

    req.usuario = usuario;
    next();
  } catch (error) {
    return res.status(401).json({ mensaje: 'Token inválido o expirado' });
  }
};

// Restringe una ruta a ciertos roles. Uso: soloRoles('administrador')
exports.soloRoles = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario || !rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({ mensaje: 'No tienes permisos para esta acción' });
    }
    next();
  };
};
