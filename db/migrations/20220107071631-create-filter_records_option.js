'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("filter_records_options", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      sourceData: {
        type: Sequelize.STRING,
      },
      sheetName: {
        type: Sequelize.STRING,
      },
      fieldRemoveDup: {
        type: Sequelize.STRING,
      },
      fieldSort: {
        type: Sequelize.STRING,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("filter_records_options");
  }
};