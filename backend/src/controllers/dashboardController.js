const { Transaction, TransactionDetail, sequelize } = require('../../models');
const { Op } = require('sequelize');

const getDashboardMetrics = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Determine filter dates based on query params
    const filterYear = year ? Number(year) : today.getFullYear();
    const filterMonth = month ? Number(month) - 1 : today.getMonth(); // 0-indexed

    const firstDayOfMonth = new Date(filterYear, filterMonth, 1);
    const lastDayOfMonth = new Date(filterYear, filterMonth + 1, 0, 23, 59, 59, 999);
    const firstDayOfYear = new Date(filterYear, 0, 1);
    const lastDayOfYear = new Date(filterYear, 11, 31, 23, 59, 59, 999);

    // Omset Today (always current day)
    const omsetToday = await Transaction.sum('total_amount', {
      where: { date: { [Op.gte]: today }, status: 'Completed' }
    }) || 0;

    // Omset for selected month
    const omsetMonth = await Transaction.sum('total_amount', {
      where: { 
        date: { [Op.gte]: firstDayOfMonth, [Op.lte]: lastDayOfMonth }, 
        status: 'Completed' 
      }
    }) || 0;

    // Omset for selected year
    const omsetYear = await Transaction.sum('total_amount', {
      where: { 
        date: { [Op.gte]: firstDayOfYear, [Op.lte]: lastDayOfYear }, 
        status: 'Completed' 
      }
    }) || 0;

    // Profit for selected month
    const totalProfit = await Transaction.sum('total_profit', {
      where: { 
        date: { [Op.gte]: firstDayOfMonth, [Op.lte]: lastDayOfMonth }, 
        status: 'Completed' 
      }
    }) || 0;

    // Total transactions for selected month
    const totalTransactions = await Transaction.count({
      where: { 
        date: { [Op.gte]: firstDayOfMonth, [Op.lte]: lastDayOfMonth }, 
        status: 'Completed' 
      }
    }) || 0;

    // Top Products for selected month
    const topProductsRaw = await TransactionDetail.findAll({
      attributes: ['name', [sequelize.fn('sum', sequelize.col('quantity')), 'qty']],
      where: { item_type: 'product' },
      include: [{ 
        model: Transaction, 
        as: 'transaction', 
        attributes: [], 
        where: { 
          status: 'Completed',
          date: { [Op.gte]: firstDayOfMonth, [Op.lte]: lastDayOfMonth }
        } 
      }],
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
        totalProfit,
        totalTransactions
      },
      topProducts: topProductsRaw,
      filter: {
        month: filterMonth + 1,
        year: filterYear
      }
    });
  } catch (error) { next(error); }
};

module.exports = { getDashboardMetrics };
