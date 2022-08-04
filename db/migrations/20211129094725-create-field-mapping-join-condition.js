'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('field_mapping_join_conditions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      sourceData: {
        type: Sequelize.STRING
      },
      withHoldingTaxData: {
        type: Sequelize.STRING
      },
      tables: {
        type: Sequelize.STRING
      },
      condition: {
        type: Sequelize.STRING
      },
      unionTable: {
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
    await queryInterface.dropTable('field_mapping_join_conditions');
  }
};