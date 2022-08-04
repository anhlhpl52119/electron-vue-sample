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
    const sheet = wb.Sheets["sub_string_field"];
    const excelRows = xlsx.utils.sheet_to_json(sheet);

    const excelDbColumnMap = {
      "Source Data": "sourceData",
      "Sheet Name": "sheetName",
      "Table Key Target": "tableKeyTarget",
      "Field Name Target": "fieldNameTarget",
      "Table Key Source": "tableKeySource",
      "Field Name Source": "fieldNameKey",
      'From': "from",
      'Length': "length",
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
        "substring_fields",
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
  },
};
