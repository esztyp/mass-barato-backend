const mongoose = require('mongoose');

const MovementSchema = new mongoose.Schema(
  {
    producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    tipo: { type: String, enum: ['entrada', 'salida', 'ajuste'], required: true },
    cantidad: { type: Number, required: true, min: 0 },
    motivo: { type: String, default: '' },
    stockResultante: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Movement', MovementSchema);
