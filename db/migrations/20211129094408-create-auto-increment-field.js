'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('auto_increment_fields', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      sourceData: {
        type: Sequelize.STRING
      },
      sheetName: {
        type: Sequelize.STRING
      },
      tableKey: {
        type: Sequelize.STRING
      },
      fieldName: {
        type: Sequelize.STRING
      },
      startFrom: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('auto_increment_fields');
  }
};