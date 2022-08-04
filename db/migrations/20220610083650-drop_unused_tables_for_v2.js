'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
     return Promise.all[
       queryInterface.dropTable('auto_increment_fields'),
       queryInterface.dropTable('data_mapping_sources'),
       queryInterface.dropTable('data_mapping_targets'),
       queryInterface.dropTable('default_mapping_values'),
       queryInterface.dropTable('field_mapping_join_conditions'),
       queryInterface.dropTable('field_mappings'),
       queryInterface.dropTable('filter_records_options'),
       queryInterface.dropTable('migration_objects'),
       queryInterface.dropTable('migration_template_fields'),
       queryInterface.dropTable('migration_template_files'),
       queryInterface.dropTable('migration_template_sheets'),
       queryInterface.dropTable('substring_fields'),
       queryInterface.dropTable('task_samples'),
       queryInterface.dropTable('user_samples')
      ];
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
