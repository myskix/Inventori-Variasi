'use strict';
const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const roles = await queryInterface.bulkInsert('Roles', [
      { name: 'Admin', description: 'Administrator dengan akses penuh', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Kasir', description: 'Akses terbatas untuk operasional POS', createdAt: new Date(), updatedAt: new Date() }
    ], { returning: true });

    // Ensure we have correct role ids depending on DB auto-increment
    const [adminRole] = await queryInterface.sequelize.query(`SELECT id from Roles WHERE name='Admin';`);
    const [kasirRole] = await queryInterface.sequelize.query(`SELECT id from Roles WHERE name='Kasir';`);

    const adminPassword = await bcrypt.hash('admin123', 10);
    const kasirPassword = await bcrypt.hash('kasir123', 10);

    await queryInterface.bulkInsert('Users', [
      {
        username: 'admin',
        password: adminPassword,
        name: 'Super Admin',
        role_id: adminRole[0].id,
        is_active: true,
        is_deleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'kasir',
        password: kasirPassword,
        name: 'Kasir Satu',
        role_id: kasirRole[0].id,
        is_active: true,
        is_deleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', null, {});
    await queryInterface.bulkDelete('Roles', null, {});
  }
};
