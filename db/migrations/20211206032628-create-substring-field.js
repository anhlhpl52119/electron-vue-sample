'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('substring_fields', {
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
      tableKeyTarget: {
        type: Sequelize.STRING
      },
      fieldNameTarget: {
        type: Sequelize.STRING
      },
      tableKeySource: {
        type: Sequelize.STRING
      },
      fieldNameKey: {
        type: Sequelize.STRING
      },
      from: {
        type: Sequelize.INTEGER
      },
      length: {
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
    await queryInterface.dropTable('substring_fields');
  }
};