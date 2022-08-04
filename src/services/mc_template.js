// import fs from "fs";

const fs = require("fs")
const cheerio = require("cheerio");



/**
 * 
 * @param {*} filePath : String
 * @returns {
 *  sheets: Array of #sheet
 * }
 * 
 * #sheet: {
 *  name: String,
    mandatory: Boolean,
    fields: Array of #fields
 * }
 * 
 *  #fields: {
 *   groupName: String,
 *   fieldDescr: String,
 *   mandatory: Boolean,
 *   type: String,
 *   length: Number,
 *   decimal: Number,
 *   sapTable: String,
 *   sapField: String
 * } 
 */
const loadMCTemplate = (filePath) => {
  const DEFAULT_FIELD_LENGTH = 80

  const FIRST_SHEET_NAME_ROW_NUMBER = 5

  // COLUMN start from COLUMN 'A'
  const GROUP_NAME_COL_NUMBER         =   3
  const FIELD_DESCRIPTION_COL_NUMBER  =   4
  const IMPORTANCE_COL_NUMBER         =   5
  const TYPE_COL_NUMBER               =   6
  const LENGTH_COL_NUMBER             =   7
  const DECIMAL_COL_NUMBER            =   8
  const SAP_TABLE_COL_NUMBER          =   9
  const SAP_FIELD_COL_NUMBER          =   10
    
  const SHEET_NAME_ROW_CELL_MERGE_ACROSS = "8"



  const mcTemplateXML = fs.readFileSync(filePath);

  const $ = cheerio.load(mcTemplateXML, {
    xmlMode: true,
  });

  
  const fieldListWorksheet = $(`Worksheet[ss\\:Name="Field List"]`);
  let sheetName = ""
  let groupName = ""
  let checkMandatory = false;


  let templateStructure = {
    'sheets': []
  }
  let sheet = {
    
  }

  $(fieldListWorksheet).find(`Row`).each((rowIndex, row) => {
    if ((rowIndex+1) >= FIRST_SHEET_NAME_ROW_NUMBER) {
      
      // sheet name row
      const cellMergeAcross = $($(row).find("Cell")[0])?.attr("ss:MergeAcross")?.toString()
      if($(row).attr('ss:Index')
        || cellMergeAcross === SHEET_NAME_ROW_CELL_MERGE_ACROSS
        || ( (rowIndex+1) === FIRST_SHEET_NAME_ROW_NUMBER )) {

        const dataEl = $(row).find("Cell").children()[0]
        checkMandatory = $(dataEl).text().includes("(mandatory)");   
        sheetName = $(dataEl).text().replace(" (mandatory)","")

        if(Object.keys(sheet).length > 0) { 
          templateStructure['sheets'].push(sheet)
        }

        sheet = {
          name: sheetName,
          mandatory: checkMandatory,
          fields: []
        }

      } else {

        let currentCellNumber = 0;

        let fieldDescr = "";
        let important = "";
        let type = "";
        let length = "";
        let decimal = "";
        let sapTable = "";
        let sapField = "";

        $(row)
          .find("Cell")
          .each((cellIndex, cell) => {
            const cellIndexAttr = $(cell).attr("ss:Index");
            const dataEl = $(cell).find("Data");
            const dataElValue = $(dataEl).text();

            if (cellIndexAttr) {
              currentCellNumber = +cellIndexAttr;
            }

            // Group name
            if (GROUP_NAME_COL_NUMBER === currentCellNumber) {
              groupName = dataElValue;
            }

            // Field Description
            if (FIELD_DESCRIPTION_COL_NUMBER === currentCellNumber) {
              fieldDescr = dataElValue;
            }

            // Important
            if (IMPORTANCE_COL_NUMBER === currentCellNumber) {
              important = !!dataElValue;
            }

            // Type
            if (TYPE_COL_NUMBER === currentCellNumber) {
              type = dataElValue;
            }

            // Length
            if (LENGTH_COL_NUMBER === currentCellNumber) {

              length = isNaN(dataElValue) ? DEFAULT_FIELD_LENGTH : dataElValue 
              
            }

            // decimal
            if (DECIMAL_COL_NUMBER === currentCellNumber) {
              decimal = dataElValue;
            }

            // sapTable
            if (SAP_TABLE_COL_NUMBER === currentCellNumber) {
              sapTable = dataElValue;
            }

            // sapField

            if (SAP_FIELD_COL_NUMBER === currentCellNumber) {
              sapField = dataElValue;
            }

            currentCellNumber++;
          });

        // sapField is mandatory
        if (sapField === "") {
          return;
        }

        sheet['fields'].push({
          groupName: groupName,
          fieldDescr: fieldDescr,
          mandatory: important,
          type: type,
          length: length ? +length : 0,
          decimal: decimal ? +decimal : 0,
          sapTable: sapTable,
          sapField: sapField,
        })


      }
    }
  })

  templateStructure['sheets'].push(sheet)
  
  return templateStructure
}



// (async () => {
//   const data = loadMCTemplate(`upload/HTK_Rehearsal 2_Source data for Supplier_none trade_v1.1 - Copy_1646034396895.xml`)
//   console.log(data)
// })()


export default {
  loadMCTemplate
}