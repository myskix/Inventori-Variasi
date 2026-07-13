const { Category } = require('../../models');

const getAll = async (req, res, next) => {
  try {
    const categories = await Category.findAll({
      where: { is_deleted: false },
      order: [['name', 'ASC']]
    });
    res.json(categories);
  } catch (error) { next(error); }
};

const create = async (req, res, next) => {
  try {
    const { name, description, is_active } = req.body;
    if (!name) return res.status(400).json({ message: 'Nama kategori wajib diisi' });

    const existing = await Category.findOne({ where: { name, is_deleted: false } });
    if (existing) return res.status(400).json({ message: 'Nama kategori sudah digunakan' });

    const category = await Category.create({ name, description, is_active: is_active ?? true, is_deleted: false });
    res.status(201).json(category);
  } catch (error) { next(error); }
};

const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, is_active } = req.body;

    const category = await Category.findByPk(id);
    if (!category || category.is_deleted) return res.status(404).json({ message: 'Kategori tidak ditemukan' });

    if (name && name !== category.name) {
      const existing = await Category.findOne({ where: { name, is_deleted: false } });
      if (existing) return res.status(400).json({ message: 'Nama kategori sudah digunakan' });
    }

    await category.update({ name, description, is_active });
    res.json(category);
  } catch (error) { next(error); }
};

const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await Category.findByPk(id);
    if (!category || category.is_deleted) return res.status(404).json({ message: 'Kategori tidak ditemukan' });

    await category.update({ is_deleted: true });
    res.json({ message: 'Kategori berhasil dihapus' });
  } catch (error) { next(error); }
};

module.exports = { getAll, create, update, remove };
