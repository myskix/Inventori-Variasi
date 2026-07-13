'use strict';

const fs = require('fs');
require('mysql2'); // Explicitly require mysql2 for Vercel Serverless static analysis
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// Static requires for Vercel Serverless (bundler compatibility)
db.Role = require('./role')(sequelize, Sequelize.DataTypes);
db.User = require('./user')(sequelize, Sequelize.DataTypes);
db.Category = require('./category')(sequelize, Sequelize.DataTypes);
db.Product = require('./product')(sequelize, Sequelize.DataTypes);
db.Transaction = require('./transaction')(sequelize, Sequelize.DataTypes);
db.TransactionDetail = require('./transactiondetail')(sequelize, Sequelize.DataTypes);
db.Warranty = require('./warranty')(sequelize, Sequelize.DataTypes);
db.StockLog = require('./stocklog')(sequelize, Sequelize.DataTypes);
db.Setting = require('./setting')(sequelize, Sequelize.DataTypes);

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
