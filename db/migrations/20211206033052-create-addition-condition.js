'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('addition_conditions', {
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
      sheetData: {
        type: Sequelize.STRING
      },
      conditionJoin: {
        type: Sequelize.STRING
      },
      conditionWhere: {
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
    await queryInterface.dropTable('addition_conditions');
  }
};