"use strict";
const cheerio = require("cheerio");
const fs = require("fs");

const SOURCE_DATA = "AP"; // this just for testing
const mc_template_file =
  "HTW_Source data for FI - Accounts payable open item_v0.1.xml";

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
    let migrationTemplates = [
      {
        sourceData: "Open PO",
        fileName: "Source data for MM - Purchase order (only open PO)_126.xml",
      },
    ];

    for (let migrationTemplate of migrationTemplates) {
      const { sourceData, fileName } = migrationTemplate;
      const filePath = "db/seeders/materials/migration_object/" + fileName;
      const mcTemplateXML = await fs.readFileSync(filePath);
      const $ = cheerio.load(mcTemplateXML, {
        xmlMode: true,
      });

      const obj = await onHandleFileXML($, sourceData, fileName);
      let arrFileMapping = [];
      console.log(arrFileMapping.length);

      // Insert for Migration Objects
      try {
        const resultMigrationObject = await queryInterface.bulkInsert(
          "migration_objects",
          obj,
          {}
        );
        arrFileMapping = onHandleDataXML(
          $,
          resultMigrationObject,
          obj[0].sourceData
        );
      } catch (error) {
        console.log(error);
      }

      // Insert for File Mapping
      try {
        // console.log(arrFileMapping.length)
        const resultFileMapping = await queryInterface.bulkInsert(
          "field_mappings",
          arrFileMapping,
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
const onHandleFileXML = async ($, sourceData, fileName) => {
  const table = $(`Worksheet[ss\\:Name="Field List"]`);
  const DocumentProperties = $(`DocumentProperties`);
  const CustomDocumentProperties = $(`CustomDocumentProperties`);
  const OBJECT_NAME = "OBJECT_NAME";
  const VERSION = "Version";
  const TITLE = "Title";

  const ObjMigration = [
    {
      sourceData: sourceData,
      name: CustomDocumentProperties.find(OBJECT_NAME).text(),
      version: DocumentProperties.find(VERSION).text(),
      code: DocumentProperties.find(TITLE).text(),
      filePath: fileName,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
  return table.length !== 0 ? ObjMigration : null;
};

const onHandleDataXML = ($, migrationId, sourceData) => {
  const FIRST_SHEET_NAME_ROW_NUMBER = 5;

  // COLUMN start from COLUMN 'A'
  const GROUP_NAME_COL_NUMBER = 3;
  const FIELD_DESCRIPTION_COL_NUMBER = 4;
  const IMPORTANCE_COL_NUMBER = 5;
  const TYPE_COL_NUMBER = 6;
  const LENGTH_COL_NUMBER = 7;
  const DECIMAL_COL_NUMBER = 8;
  const SAP_TABLE_COL_NUMBER = 9;
  const SAP_FIELD_COL_NUMBER = 10;
  const ECC_TABLE_COL_NUMBER = 11;
  const ECC_FIELD_COL_NUMBER = 12;

  const SHEET_NAME_ROW_CELL_MERGE_ACROSS = "8";

  const fieldListWorksheet = $(`Worksheet[ss\\:Name="Field List"]`);
  let sheetName = "";
  let groupName = "";
  let fieldMappings = [];

  $(fieldListWorksheet)
    .find(`Row`)
    .each((rowIndex, row) => {
      if (rowIndex + 1 >= FIRST_SHEET_NAME_ROW_NUMBER) {
        // sheet name row
        const cellMergeAcross = $($(row).find("Cell")[0])
          ?.attr("ss:MergeAcross")
          ?.toString();
        if (
          $(row).attr("ss:Index") ||
          cellMergeAcross === SHEET_NAME_ROW_CELL_MERGE_ACROSS ||
          rowIndex + 1 === FIRST_SHEET_NAME_ROW_NUMBER
        ) {
          const dataEl = $(row).find("Cell").children()[0];
          sheetName = $(dataEl).text().replace(" (mandatory)", "");
        } else {
          // const cells = $(row).find("Cell")
          let currentCellNumber = 0;

          let fieldDescr = "";
          let important = "";
          let type = "";
          let length = "";
          let decimal = "";
          let sapTable = "";
          let sapField = "";
          let eccTable = "";
          let eccField = "";

          $(row)
            .find("Cell")
            .each((cellIndex, cell) => {
              const cellIndexAttr = $(cell).attr("ss:Index");

              if (cellIndexAttr) {
                currentCellNumber = +cellIndexAttr;
              }

              // Group name
              if (GROUP_NAME_COL_NUMBER === currentCellNumber) {
                const dataEl = $(cell).find("Data");
                groupName = $(dataEl).text();
              }

              // Field Description
              if (FIELD_DESCRIPTION_COL_NUMBER === currentCellNumber) {
                const dataEl = $(cell).find("Data");
                fieldDescr = $(dataEl).text();
              }

              // Important
              if (IMPORTANCE_COL_NUMBER === currentCellNumber) {
                const dataEl = $(cell).find("Data");
                important = !!$(dataEl).text();
              }

              // Type
              if (TYPE_COL_NUMBER === currentCellNumber) {
                const dataEl = $(cell).find("Data");
                type = $(dataEl).text();
              }

              // Length
              if (LENGTH_COL_NUMBER === currentCellNumber) {
                const dataEl = $(cell).find("Data");
                length = $(dataEl).text();
              }

              // decimal
              if (DECIMAL_COL_NUMBER === currentCellNumber) {
                const dataEl = $(cell).find("Data");
                decimal = $(dataEl).text();
              }

              // sapTable
              if (SAP_TABLE_COL_NUMBER === currentCellNumber) {
                const dataEl = $(cell).find("Data");
                sapTable = $(dataEl).text();
              }

              // sapField
              if (SAP_FIELD_COL_NUMBER === currentCellNumber) {
                const dataEl = $(cell).find("Data");
                sapField = $(dataEl).text();
              }

              // ECCTable
              if (ECC_TABLE_COL_NUMBER === currentCellNumber) {
                const dataEl = $(cell).find("Data");
                eccTable = $(dataEl).text();
              }

              // eccField
              if (ECC_FIELD_COL_NUMBER === currentCellNumber) {
                const dataEl = $(cell).find("Data");
                eccField = $(dataEl).text();
              }

              currentCellNumber++;
            });

          const fieldMapping = {
            sheetName: sheetName,
            groupName: groupName,
            fieldDescr: fieldDescr,
            mandatory: important,
            type: type,
            length: length ? +length : 0,
            decimal: decimal ? +decimal : 0,
            sapTable: sapTable,
            sapField: sapField,
            eccTable: eccTable,
            eccField: eccField,
            migrationObjectId: migrationId,
            sourceData: sourceData,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          fieldMappings.push(fieldMapping);
        }
      }
    });
  return fieldMappings;
};
