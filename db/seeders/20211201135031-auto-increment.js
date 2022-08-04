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
    const sheet = wb.Sheets["auto_increment"];
    const excelRows = xlsx.utils.sheet_to_json(sheet);

    const excelDbColumnMap = {
      "Source Data": "sourceData",
      "Sheet Name": "sheetName",
      "Table Key": "tableKey",
      "Field Name": "fieldName",
      "From": "startFrom",
    };
    console.log(excelRows);

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
        "auto_increment_fields",
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
    await queryInterface.bulkDelete("auto_increment_fields", null, {});
  },
};
