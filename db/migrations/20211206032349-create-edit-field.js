'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('edit_fields', {
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
      edit: {
        type: Sequelize.STRING
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
    await queryInterface.dropTable('edit_fields');
  }
};