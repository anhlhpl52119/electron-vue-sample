'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("migration_template_sheets", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      migrationTemplateFileId: {
        type: Sequelize.INTEGER,
      },
      sheetName: {
        type: Sequelize.STRING,
      },
      sapTable: {
        type: Sequelize.STRING,
      },
      mandatorySheetName: {
        type: Sequelize.BOOLEAN,
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
    await queryInterface.dropTable('migration_template_sheets');
  }
};