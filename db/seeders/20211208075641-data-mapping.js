'use strict';
const xlsx = require("xlsx");

const SOURCE_DATA = "Open PO" // this just for testing

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

     const option_file = "data_mapping.xlsx";
     const wb = xlsx.readFile("db/seeders/materials/" + option_file);
    //  const sheet = wb.Sheets["source_data"];
    //  const excelRows = xlsx.utils.sheet_to_json(sheet);
    let sourceDataMappingRecords = []
    for(let sheetName of wb.SheetNames) {
      const sheet = wb.Sheets[sheetName]
      const templateSheetName =  sheet["A1"]["v"]
      
      const excelRows = xlsx.utils.sheet_to_json(sheet,  {
        header: 1,
        defval: '',
        blankrows: true
      })
      const columns = excelRows[1]

      const excelRowsJson = xlsx.utils.sheet_to_json(sheet, {
        header: columns,
      })
      const sourceKeys = columns.filter(key => key.split("_").length > 1)
                                .map(key => key.split("_")[0])
      const targetKeys = columns.filter(key => key.split("_").length === 1)

      for(let i = 2; i < excelRowsJson.length; i++) {
        // console.log(`${templateSheetName} - row: ${i}` )
        const row = excelRowsJson[i]
        for(let targetKey of targetKeys) {
          const targetValue =  row[targetKey]
          // console.log(targetValue)
          const dataMappingTargetId = await queryInterface.bulkInsert(
            "data_mapping_targets",
            [{
              sourceData: SOURCE_DATA,
              sheetName: templateSheetName,
              fieldName: targetKey,
              value: targetValue,
              createdAt: new Date(),
              updatedAt: new Date()
            }],
            {}
          );

          sourceDataMappingRecords = sourceDataMappingRecords.concat(sourceKeys.map(key => {
            const sourceValue = row[key + "_key"]
            return {
              dataMappingTargetId: dataMappingTargetId,
              fieldName: key,
              value: sourceValue,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          }))

          // try {
          //   await queryInterface.bulkInsert(
          //     "data_mapping_sources",
          //     dataMappingSources,
          //     {}
          //   );
          // } catch (error) {
            
          // }
          
        }
      }
    }
    try {
      await queryInterface.bulkInsert(
        "data_mapping_sources",
        sourceDataMappingRecords,
        {}
      );
    } catch (error) {
      
    }
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
