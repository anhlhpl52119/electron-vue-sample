"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("field_mappings", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      sheetName: {
        type: Sequelize.STRING,
      },
      groupName: {
        type: Sequelize.STRING,
      },
      fieldDescr: {
        type: Sequelize.STRING,
      },
      mandatory: {
        type: Sequelize.BOOLEAN,
      },
      type: {
        type: Sequelize.STRING,
      },
      length: {
        type: Sequelize.INTEGER,
      },
      decimal: {
        type: Sequelize.INTEGER,
      },
      sapTable: {
        type: Sequelize.STRING,
      },
      sapField: {
        type: Sequelize.STRING,
      },
      eccTable: {
        type: Sequelize.STRING,
      },
      eccField: {
        type: Sequelize.STRING,
      },
      migrationObjectId: {
        type: Sequelize.INTEGER,
      },
      sourceData: {
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
    await queryInterface.dropTable("field_mappings");
  },
};
