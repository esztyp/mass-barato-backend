const Product = require('../models/Product');
const Movement = require('../models/Movement');

// GET /api/products - listar todos los productos
exports.getProducts = async (req, res) => {
  try {
    const productos = await Product.find().sort({ createdAt: -1 });
    res.json(productos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener productos', error: error.message });
  }
};

// GET /api/products/:id - obtener un producto
exports.getProduct = async (req, res) => {
  try {
    const producto = await Product.findById(req.params.id);
    if (!producto) return res.status(404).json({ mensaje: 'Producto no encontrado' });
    res.json(producto);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener el producto', error: error.message });
  }
};

// POST /api/products - crear producto
exports.createProduct = async (req, res) => {
  try {
    const producto = await Product.create(req.body);
    res.status(201).json(producto);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ mensaje: 'Ya existe un producto con ese código' });
    }
    res.status(400).json({ mensaje: 'Error al crear el producto', error: error.message });
  }
};

// PUT /api/products/:id - actualizar datos del producto (no stock)
exports.updateProduct = async (req, res) => {
  try {
    const { stockActual, ...resto } = req.body;
    const producto = await Product.findByIdAndUpdate(req.params.id, resto, {
      new: true,
      runValidators: true,
    });
    if (!producto) return res.status(404).json({ mensaje: 'Producto no encontrado' });
    res.json(producto);
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al actualizar el producto', error: error.message });
  }
};

// DELETE /api/products/:id
exports.deleteProduct = async (req, res) => {
  try {
    const producto = await Product.findByIdAndDelete(req.params.id);
    if (!producto) return res.status(404).json({ mensaje: 'Producto no encontrado' });
    await Movement.deleteMany({ producto: producto._id });
    res.json({ mensaje: 'Producto eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar el producto', error: error.message });
  }
};

// POST /api/products/:id/movimiento - registrar entrada/salida/ajuste de stock
exports.registerMovement = async (req, res) => {
  try {
    const { tipo, cantidad, motivo } = req.body;
    const producto = await Product.findById(req.params.id);
    if (!producto) return res.status(404).json({ mensaje: 'Producto no encontrado' });

    if (!['entrada', 'salida', 'ajuste'].includes(tipo)) {
      return res.status(400).json({ mensaje: 'Tipo de movimiento inválido' });
    }
    if (cantidad === undefined || cantidad < 0) {
      return res.status(400).json({ mensaje: 'Cantidad inválida' });
    }

    if (tipo === 'entrada') {
      producto.stockActual += cantidad;
    } else if (tipo === 'salida') {
      if (cantidad > producto.stockActual) {
        return res.status(400).json({ mensaje: 'Stock insuficiente para esta salida' });
      }
      producto.stockActual -= cantidad;
    } else if (tipo === 'ajuste') {
      producto.stockActual = cantidad;
    }

    await producto.save();

    const movimiento = await Movement.create({
      producto: producto._id,
      tipo,
      cantidad,
      motivo: motivo || '',
      stockResultante: producto.stockActual,
    });

    res.status(201).json({ producto, movimiento });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al registrar el movimiento', error: error.message });
  }
};

// GET /api/products/alertas/bajos - productos con stock bajo o agotado
exports.getAlertas = async (req, res) => {
  try {
    const productos = await Product.find();
    const alertas = productos.filter((p) => p.stockActual <= p.stockMinimo);
    res.json(alertas);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener alertas', error: error.message });
  }
};
