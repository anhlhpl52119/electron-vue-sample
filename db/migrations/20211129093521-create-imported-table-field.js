'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('imported_table_fields', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      fieldName: {
        type: Sequelize.STRING
      },
      importedTableId: {
        allowNull: false,
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

    // add constrains
    await queryInterface.addConstraint("imported_table_fields", {
      type: 'UNIQUE',
      fields: ['fieldName', 'importedTableId'],
      name: 'unique_imported_table_and_field_name',
    });

  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('imported_table_fields');
  }
};