'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TransactionDetail extends Model {
    static associate(models) {
      TransactionDetail.belongsTo(models.Transaction, { foreignKey: 'transaction_id', as: 'transaction' });
    }
  }
  TransactionDetail.init({
    transaction_id: DataTypes.INTEGER,
    item_type: DataTypes.STRING,
    item_id: DataTypes.STRING,
    name: DataTypes.STRING,
    quantity: DataTypes.INTEGER,
    unit_price: DataTypes.DECIMAL,
    subtotal: DataTypes.DECIMAL,
    difficulty: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'TransactionDetail',
  });
  return TransactionDetail;
};