const { Warranty } = require('../../models');
const { Op } = require('sequelize');

const checkWarranty = async (req, res, next) => {
  try {
    const { plat, phone, invoice, name } = req.query;
    
    // Construct search conditions based on provided params
    const conditions = [];
    if (plat) conditions.push({ customer_plat: plat });
    if (phone) conditions.push({ customer_phone: phone });
    if (invoice) conditions.push({ invoice_no: invoice });
    if (name) conditions.push({ customer_name: { [Op.like]: `%${name}%` } });

    if (conditions.length === 0) {
      return res.json([]); // return empty if no search params
    }

    const warranties = await Warranty.findAll({
      where: {
        [Op.or]: conditions
      },
      order: [['issue_date', 'DESC']]
    });

    res.json(warranties);
  } catch (error) { next(error); }
};

const claimWarranty = async (req, res, next) => {
  try {
    const { id } = req.params;
    const warranty = await Warranty.findByPk(id);
    if (!warranty) return res.status(404).json({ message: 'Garansi tidak ditemukan' });
    
    const today = new Date();
    if (new Date(warranty.expiry_date) < today) {
      return res.status(400).json({ message: 'Masa garansi sudah habis' });
    }
    if (warranty.status !== 'Active') {
      return res.status(400).json({ message: `Garansi tidak dapat di-klaim (Status: ${warranty.status})` });
    }

    warranty.status = 'Claimed';
    await warranty.save();
    
    res.json({ message: 'Klaim garansi berhasil dicatat', warranty });
  } catch (error) { next(error); }
};

module.exports = { checkWarranty, claimWarranty };
