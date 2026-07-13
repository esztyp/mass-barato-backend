const ExcelJS = require('exceljs');
const Product = require('../models/Product');
const Movement = require('../models/Movement');


exports.exportarProductosExcel = async (req, res) => {
  try {
    const productos = await Product.find().sort({ nombre: 1 });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'MASS BARATO';
    workbook.created = new Date();

    const hoja = workbook.addWorksheet('Inventario');

    hoja.columns = [
      { header: 'Código', key: 'codigo', width: 14 },
      { header: 'Nombre', key: 'nombre', width: 30 },
      { header: 'Categoría', key: 'categoria', width: 18 },
      { header: 'Stock actual', key: 'stockActual', width: 14 },
      { header: 'Stock mínimo', key: 'stockMinimo', width: 14 },
      { header: 'Unidad', key: 'unidad', width: 12 },
      { header: 'Precio compra (S/)', key: 'precioCompra', width: 18 },
      { header: 'Precio venta (S/)', key: 'precioVenta', width: 18 },
      { header: 'Valor en stock (S/)', key: 'valorStock', width: 18 },
      { header: 'Proveedor', key: 'proveedor', width: 22 },
      { header: 'Estado', key: 'estado', width: 14 },
    ];

    hoja.getRow(1).font = { bold: true };
    hoja.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE8A33D' },
    };

    let valorTotalInventario = 0;

    productos.forEach((p) => {
      const valorStock = p.stockActual * p.precioCompra;
      valorTotalInventario += valorStock;
      hoja.addRow({
        codigo: p.codigo,
        nombre: p.nombre,
        categoria: p.categoria,
        stockActual: p.stockActual,
        stockMinimo: p.stockMinimo,
        unidad: p.unidad,
        precioCompra: p.precioCompra,
        precioVenta: p.precioVenta,
        valorStock: Number(valorStock.toFixed(2)),
        proveedor: p.proveedor,
        estado: p.estado === 'ok' ? 'Normal' : p.estado === 'bajo' ? 'Stock bajo' : 'Agotado',
      });
    });

    // Fila de totales
    const filaTotal = hoja.addRow({
      nombre: 'TOTAL',
      valorStock: Number(valorTotalInventario.toFixed(2)),
    });
    filaTotal.font = { bold: true };

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=inventario_mass_barato_${Date.now()}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al generar el reporte', error: error.message });
  }
};

// GET /api/reports/movimientos/excel - exporta el historial de movimientos a Excel
exports.exportarMovimientosExcel = async (req, res) => {
  try {
    const movimientos = await Movement.find()
      .populate('producto', 'nombre codigo')
      .sort({ createdAt: -1 })
      .limit(1000);

    const workbook = new ExcelJS.Workbook();
    const hoja = workbook.addWorksheet('Movimientos');

    hoja.columns = [
      { header: 'Fecha', key: 'fecha', width: 20 },
      { header: 'Código producto', key: 'codigo', width: 16 },
      { header: 'Producto', key: 'nombre', width: 28 },
      { header: 'Tipo', key: 'tipo', width: 14 },
      { header: 'Cantidad', key: 'cantidad', width: 12 },
      { header: 'Stock resultante', key: 'stockResultante', width: 16 },
      { header: 'Motivo', key: 'motivo', width: 30 },
    ];

    hoja.getRow(1).font = { bold: true };
    hoja.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE8A33D' },
    };

    movimientos.forEach((m) => {
      hoja.addRow({
        fecha: new Date(m.createdAt).toLocaleString('es-PE'),
        codigo: m.producto?.codigo || '—',
        nombre: m.producto?.nombre || 'Producto eliminado',
        tipo: m.tipo,
        cantidad: m.cantidad,
        stockResultante: m.stockResultante,
        motivo: m.motivo || '',
      });
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=movimientos_mass_barato_${Date.now()}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al generar el reporte', error: error.message });
  }
};
