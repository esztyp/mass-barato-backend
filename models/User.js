const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true, lowercase: true },
    nombre: { type: String, required: true, trim: true },
    password: { type: String, required: true },
    rol: { type: String, enum: ['administrador', 'almacenero'], default: 'almacenero' },
    activo: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Antes de guardar, encripta la contraseña si fue modificada
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compara la contraseña ingresada con el hash guardado
UserSchema.methods.compararPassword = function (passwordIngresada) {
  return bcrypt.compare(passwordIngresada, this.password);
};

// Nunca exponer el hash de la contraseña en las respuestas JSON
UserSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    return ret;
  },
});

module.exports = mongoose.model('User', UserSchema);
