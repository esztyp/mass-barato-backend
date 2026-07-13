// Script para crear el primer usuario administrador.
// Se ejecuta una sola vez, manualmente, desde la terminal:
//   node scripts/seedAdmin.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function crearAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado a MongoDB');

    const existe = await User.findOne({ username: 'admin' });
    if (existe) {
      console.log('El usuario "admin" ya existe. No se creó ninguno nuevo.');
      process.exit(0);
    }

    const admin = await User.create({
      username: 'admin',
      nombre: 'Administrador Principal',
      password: 'admin123', // cámbiala apenas inicies sesión por primera vez
      rol: 'administrador',
    });

    console.log('Usuario administrador creado con éxito:');
    console.log('   Usuario: admin');
    console.log('   Contraseña: admin123');
    console.log('Inicia sesión y cambia esta contraseña cuanto antes.');
    process.exit(0);
  } catch (error) {
    console.error('Error al crear el administrador:', error.message);
    process.exit(1);
  }
}

crearAdmin();
