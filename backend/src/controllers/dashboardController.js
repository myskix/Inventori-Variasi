const { Transaction, TransactionDetail, sequelize } = require('../../models');
const { Op } = require('sequelize');

const getDashboardMetrics = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const firstDayOfYear = new Date(today.getFullYear(), 0, 1);

    // Basic Metrics
    const omsetToday = await Transaction.sum('total_amount', {
      where: { date: { [Op.gte]: today }, status: 'Completed' }
    }) || 0;

    const omsetMonth = await Transaction.sum('total_amount', {
      where: { date: { [Op.gte]: firstDayOfMonth }, status: 'Completed' }
    }) || 0;

    const omsetYear = await Transaction.sum('total_amount', {
      where: { date: { [Op.gte]: firstDayOfYear }, status: 'Completed' }
    }) || 0;

    const totalProfit = await Transaction.sum('total_profit', {
      where: { status: 'Completed' }
    }) || 0;

    // Top Products
    const topProductsRaw = await TransactionDetail.findAll({
      attributes: ['name', [sequelize.fn('sum', sequelize.col('quantity')), 'qty']],
      where: { item_type: 'product' },
      include: [{ model: Transaction, as: 'transaction', attributes: [], where: { status: 'Completed' } }],
      group: ['name'],
      order: [[sequelize.fn('sum', sequelize.col('quantity')), 'DESC']],
      limit: 5,
      raw: true
    });

    res.json({
      metrics: {
        omsetToday,
        omsetMonth,
        omsetYear,
        totalProfit
      },
      topProducts: topProductsRaw
    });
  } catch (error) { next(error); }
};

module.exports = { getDashboardMetrics };
