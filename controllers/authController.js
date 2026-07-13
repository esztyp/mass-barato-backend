const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generarToken = (usuario) =>
  jwt.sign({ id: usuario._id, rol: usuario.rol }, process.env.JWT_SECRET, {
    expiresIn: '8h',
  });

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ mensaje: 'Usuario y contraseña son obligatorios' });
    }

    const usuario = await User.findOne({ username: username.toLowerCase() });
    if (!usuario || !usuario.activo) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }

    const coincide = await usuario.compararPassword(password);
    if (!coincide) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }

    const token = generarToken(usuario);
    res.json({ token, usuario });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al iniciar sesión', error: error.message });
  }
};

// GET /api/auth/me - devuelve los datos del usuario autenticado
exports.perfil = async (req, res) => {
  res.json(req.usuario);
};

// POST /api/auth/register - crear un nuevo usuario (solo administradores)
exports.registrar = async (req, res) => {
  try {
    const { username, nombre, password, rol } = req.body;
    if (!username || !nombre || !password) {
      return res.status(400).json({ mensaje: 'Faltan campos obligatorios' });
    }
    const usuario = await User.create({ username, nombre, password, rol });
    res.status(201).json(usuario);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ mensaje: 'Ese nombre de usuario ya existe' });
    }
    res.status(400).json({ mensaje: 'Error al crear el usuario', error: error.message });
  }
};

// GET /api/auth/usuarios - listar usuarios (solo administradores)
exports.listarUsuarios = async (req, res) => {
  try {
    const usuarios = await User.find().sort({ createdAt: -1 });
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al listar usuarios', error: error.message });
  }
};

// PUT /api/auth/usuarios/:id - actualizar rol o estado de un usuario (solo administradores)
exports.actualizarUsuario = async (req, res) => {
  try {
    const { rol, activo, nombre } = req.body;
    const usuario = await User.findByIdAndUpdate(
      req.params.id,
      { rol, activo, nombre },
      { new: true, runValidators: true }
    );
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    res.json(usuario);
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al actualizar el usuario', error: error.message });
  }
};

// DELETE /api/auth/usuarios/:id (solo administradores)
exports.eliminarUsuario = async (req, res) => {
  try {
    if (req.params.id === String(req.usuario._id)) {
      return res.status(400).json({ mensaje: 'No puedes eliminar tu propia cuenta' });
    }
    const usuario = await User.findByIdAndDelete(req.params.id);
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    res.json({ mensaje: 'Usuario eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar el usuario', error: error.message });
  }
};
