const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    codigo: { type: String, required: true, unique: true, trim: true },
    nombre: { type: String, required: true, trim: true },
    categoria: { type: String, default: 'General', trim: true },
    stockActual: { type: Number, required: true, default: 0, min: 0 },
    stockMinimo: { type: Number, required: true, default: 5, min: 0 },
    precioCompra: { type: Number, required: true, default: 0, min: 0 },
    precioVenta: { type: Number, required: true, default: 0, min: 0 },
    unidad: { type: String, default: 'unidad' },
    proveedor: { type: String, default: '' },
  },
  { timestamps: true }
);

ProductSchema.virtual('estado').get(function () {
  if (this.stockActual <= 0) return 'agotado';
  if (this.stockActual <= this.stockMinimo) return 'bajo';
  return 'ok';
});

ProductSchema.set('toJSON', { virtuals: true });
ProductSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', ProductSchema);
