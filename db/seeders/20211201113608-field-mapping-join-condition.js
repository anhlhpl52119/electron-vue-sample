"use strict";
const xlsx = require("xlsx");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    const option_file = "options.xlsx";
    const wb = xlsx.readFile("db/seeders/materials/" + option_file);
    const sheet = wb.Sheets["join_condition"];
    const excelRows = xlsx.utils.sheet_to_json(sheet);

    const excelDbColumnMap = {
      "Source Data": "sourceData",
      "Withholding Tax Data": "withholdingTaxData",
      "Tables": "tables",
      "Condition": "condition",
      "Union Table": "unionTable",
    };
    const records = excelRows.map((record) => {
      for (let excelColumn in excelDbColumnMap) {
        record[excelDbColumnMap[excelColumn]] = record[excelColumn];
        delete record[excelColumn];
      }
      record.createdAt = new Date();
      record.updatedAt = new Date();

      return record;
    });

    try {
      const result = await queryInterface.bulkInsert(
        "field_mapping_join_conditions",
        records,
        {}
      );
    } catch (error) {
      console.log(error);
    }
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete("field_mapping_join_conditions", null, {});
  },
};
