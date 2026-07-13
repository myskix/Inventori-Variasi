'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Transaction extends Model {
    static associate(models) {
      Transaction.hasMany(models.TransactionDetail, { foreignKey: 'transaction_id', as: 'items' });
      Transaction.hasOne(models.Warranty, { foreignKey: 'transaction_id', as: 'warranty' });
      Transaction.belongsTo(models.User, { foreignKey: 'cashier_id', as: 'cashier' });
    }
  }
  Transaction.init({
    invoice_no: DataTypes.STRING,
    date: DataTypes.DATE,
    customer_name: DataTypes.STRING,
    customer_phone: DataTypes.STRING,
    customer_plat: DataTypes.STRING,
    customer_vehicle: DataTypes.STRING,
    customer_notes: DataTypes.TEXT,
    total_amount: DataTypes.DECIMAL,
    total_modal: DataTypes.DECIMAL,
    total_profit: DataTypes.DECIMAL,
    payment_method: DataTypes.STRING,
    cashier_id: DataTypes.INTEGER,
    status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Transaction',
  });
  return Transaction;
};