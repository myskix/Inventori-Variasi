const { StockLog, Product } = require('../../models');

const getStockLogs = async (req, res, next) => {
  try {
    const logs = await StockLog.findAll({
      include: [{ model: Product, as: 'product', attributes: ['name', 'code'] }],
      order: [['date', 'DESC']],
      limit: 500 // Limit for performance
    });
    
    const mapped = logs.map(l => ({
      ...l.toJSON(),
      product_name: l.product ? l.product.name : 'Unknown'
    }));
    
    res.json(mapped);
  } catch (error) { next(error); }
};

module.exports = { getStockLogs };
