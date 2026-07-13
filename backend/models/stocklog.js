'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class StockLog extends Model {
    static associate(models) {
      StockLog.belongsTo(models.Product, { foreignKey: 'product_id', as: 'product' });
    }
  }
  StockLog.init({
    product_id: DataTypes.INTEGER,
    change_qty: DataTypes.INTEGER,
    type: DataTypes.STRING,
    remarks: DataTypes.STRING,
    date: DataTypes.DATE,
    reference_id: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'StockLog',
  });
  return StockLog;
};