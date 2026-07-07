const Movement = require('../models/Movement');

// GET /api/movements - historial completo de movimientos (últimos 100)
exports.getMovements = async (req, res) => {
  try {
    const movimientos = await Movement.find()
      .populate('producto', 'nombre codigo')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(movimientos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener movimientos', error: error.message });
  }
};
