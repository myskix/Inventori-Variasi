const { Product, Category } = require('../../models');

const getAll = async (req, res, next) => {
  try {
    const products = await Product.findAll({
      where: { is_deleted: false },
      include: [{ model: Category, as: 'category', attributes: ['name'] }],
      order: [['name', 'ASC']]
    });
    // map the output to flatten category_name if needed
    const mapped = products.map(p => ({
      ...p.toJSON(),
      category_name: p.category ? p.category.name : 'Unknown'
    }));
    res.json(mapped);
  } catch (error) { next(error); }
};

const create = async (req, res, next) => {
  try {
    const { code, name, description, category_id, harga_modal, harga_jual, stok_minimum, stok_saat_ini, is_active } = req.body;
    
    if (!code || !name || !category_id) return res.status(400).json({ message: 'SKU, Nama, dan Kategori wajib diisi' });

    const existing = await Product.findOne({ where: { code, is_deleted: false } });
    if (existing) return res.status(400).json({ message: 'SKU sudah digunakan' });

    const product = await Product.create({
      code, name, description, category_id, harga_modal, harga_jual, stok_minimum, stok_saat_ini, is_active: is_active ?? true, is_deleted: false
    });
    res.status(201).json(product);
  } catch (error) { next(error); }
};

const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { code, name, description, category_id, harga_modal, harga_jual, stok_minimum, stok_saat_ini, is_active } = req.body;

    const product = await Product.findByPk(id);
    if (!product || product.is_deleted) return res.status(404).json({ message: 'Produk tidak ditemukan' });

    if (code && code !== product.code) {
      const existing = await Product.findOne({ where: { code, is_deleted: false } });
      if (existing) return res.status(400).json({ message: 'SKU sudah digunakan' });
    }

    await product.update({
      code, name, description, category_id, harga_modal, harga_jual, stok_minimum, stok_saat_ini, is_active
    });
    res.json(product);
  } catch (error) { next(error); }
};

const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);
    if (!product || product.is_deleted) return res.status(404).json({ message: 'Produk tidak ditemukan' });

    await product.update({ is_deleted: true });
    res.json({ message: 'Produk berhasil dihapus' });
  } catch (error) { next(error); }
};

const restore = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);
    if (!product || !product.is_deleted) return res.status(404).json({ message: 'Produk tidak ditemukan' });

    await product.update({ is_deleted: false });
    res.json({ message: 'Produk berhasil dipulihkan' });
  } catch (error) { next(error); }
};

const updateStock = async (req, res, next) => {
  const { sequelize, StockLog } = require('../../models');
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { change_qty, log_type, remarks } = req.body;
    
    const product = await Product.findByPk(id, { transaction: t, lock: true });
    if (!product || product.is_deleted) throw new Error('Produk tidak ditemukan');

    product.stok_saat_ini += Number(change_qty);
    if (product.stok_saat_ini < 0) throw new Error('Stok tidak boleh negatif');
    
    await product.save({ transaction: t });

    await StockLog.create({
      product_id: product.id,
      change_qty: Number(change_qty),
      type: log_type || 'Adjustment',
      remarks: remarks || 'Penyesuaian Opname',
      date: new Date(),
      reference_id: `ADJ-${Date.now()}`
    }, { transaction: t });

    await t.commit();
    res.json({ message: 'Stok berhasil diperbarui', product });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

module.exports = { getAll, create, update, remove, restore, updateStock };
