'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("migration_template_fields", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      migrationTemplateSheetId: {
        type: Sequelize.INTEGER,
      },
      sapField: {
        type: Sequelize.STRING,
      },
      type: {
        type: Sequelize.STRING,
      },
      mandatory: {
        type: Sequelize.BOOLEAN,
      },
      length: {
        type: Sequelize.INTEGER,
      },
      decimal: {
        type: Sequelize.INTEGER,
      },
      order: {
        type: Sequelize.INTEGER,
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
    await queryInterface.dropTable('migration_template_fields');
  }
};