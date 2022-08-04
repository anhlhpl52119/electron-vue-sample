"use strict";
const xlsx = require("xlsx");
const fs = require("fs");
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
    const fileNames = fs
      .readdirSync("db/seeders/materials/data_table/")
      .filter((fileName) => {
        return fileName.toLowerCase().includes(".xlsx");
      });

    for (let fileName of fileNames) {
      const wb = xlsx.readFile("db/seeders/materials/data_table/" + fileName);
      const sheet = wb.Sheets[wb.SheetNames[0]];
      let records = xlsx.utils.sheet_to_json(sheet, {raw: true});
      const columnNames = Object.keys(records[0]);
      const logicalTableName = fileName.split("_").slice(-2, -1);
      const physicalTableName =
        Date.now() + "_imported_table_" + logicalTableName;

      const correctedColumnNames = columnNames.filter(
        (columnName) => !columnName.includes("/")
      );
      records = records.map(row => {
        return correctedColumnNames.reduce((result, column) => {
          result[column] = row[column]
          return result
        },{})
      }) 
      const columns = correctedColumnNames.reduce((result, columnName) => {
        result[columnName] = {
          type: Sequelize.STRING,
        };
        return result;
      }, {});

      columns["id"] = {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      };

      // try {

      //   console.log("created table", result)

      // } catch (error) {
      //   console.log("create table error")
      //   console.log("create table error", error)
      // }
      await queryInterface.createTable(physicalTableName, columns, {});
      console.log("run", physicalTableName);

      try {
        const result = await queryInterface.bulkInsert(
          physicalTableName,
          records,
          {}
        );
      } catch (error) {
        console.log(error);
      }

      try {
        const importedTableRecords = [
          {
            logicalTableName: logicalTableName,
            importedFilePath: "",
            physicalDbName: physicalTableName,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];

        const importedTableId = await queryInterface.bulkInsert(
          "imported_tables",
          importedTableRecords,
          {}
        );

        const importedTableFieldRecords = correctedColumnNames.map(
          (correctedColumnName) => {
            return {
              fieldName: correctedColumnName,
              importedTableId: importedTableId,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
          }
        );
        await queryInterface.bulkInsert(
          "imported_table_fields",
          importedTableFieldRecords,
          {}
        );
      } catch (error) {
        console.log(error);
      }
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
