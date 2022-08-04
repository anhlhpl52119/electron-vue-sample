import SqlExecutorService from "./sql_executor"
import McTemplateService from "./mc_template"
import SqlGeneratorService from "./sql_generator"

import fs from "fs"

const FIELD_DATA_TYPE = {
  NUMBER: "Number",
  TEXT: "Text",
  DATE: "Date"
}

const TEMPLATE_XML_DATA_TYPE = {
  NUMBER:    "Number",
  STRING:    "String",
  DATETIME:  "DateTime"
}

const _mappingRowField = (row, templateFieldMappingDict) => {
  let newRow = {}

  for(const templateFieldMapping in templateFieldMappingDict) {
    const queryField = templateFieldMappingDict[templateFieldMapping]
    if(queryField && row[queryField]) {
      newRow[templateFieldMapping] = row[queryField]
    }
  }

  return newRow
}

const _getDataWithFormat =  (data, dataType, field) => {
  let result = data || "";

  switch (dataType) {
    case TEMPLATE_XML_DATA_TYPE.DATETIME: {
      if (data) {
        try {
          const date = new Date(data) // date with current timezone

          if( isNaN(date.getTime()) ) {
            throw `${data} is not a valid date`
          }
          result = new Date(date.getFullYear(), date.getMonth(), date.getDate(), -(date.getTimezoneOffset()/60)).toISOString();
 
        } catch (error) {
          console.error(error)
        }
      }
      break
    }
    case TEMPLATE_XML_DATA_TYPE.NUMBER: {
      if (data) {
        const decimal = field['decimal'] || 0
        try {
          const numberStr = data.toString().replace(/,/g ,"") //remove thousand comma separator 
          result = Number(numberStr).toFixed(parseInt(decimal))
        
        } catch (error) {
          console.error(error)
        }
      }
      break
    }
    case TEMPLATE_XML_DATA_TYPE.STRING: {
      if(data){
        result = _encodingEscapeCharacter(data)
      }
    }
  }

  return result ;
};

const _encodingEscapeCharacter = (cellData) => {
  return cellData.toString()
          .replace(/&/g,"&amp;")
          .replace(/</g,"&lt;")
          .replace(/>/g,"&gt;")
          .replace(/"/g,"&quot;")
          .replace(/'/g,"&apos;")
}


const _getDataTypeXmlFormat = (templateDataFormat) => {
  switch(templateDataFormat) {
    case FIELD_DATA_TYPE.NUMBER  : return TEMPLATE_XML_DATA_TYPE.NUMBER
    case FIELD_DATA_TYPE.TEXT    : return TEMPLATE_XML_DATA_TYPE.STRING
    case FIELD_DATA_TYPE.DATE    : return TEMPLATE_XML_DATA_TYPE.DATETIME
  }

  return TEMPLATE_XML_DATA_TYPE.STRING;
}

const _generateXmlRow = (row, fields) => {
  let rowXml = `<Row ss:AutoFitHeight="0">`
  let cellsXml = ""
  for(let field of fields) {
    const fieldName = field['sapField']
    const dataType = _getDataTypeXmlFormat(field['type'])
    const cellData = _getDataWithFormat(row[fieldName], dataType, field);
    const dataXml = cellData ? `<Data ss:Type="${dataType}">${ cellData }</Data>` : ''
    cellsXml +=  `<Cell>${dataXml}</Cell>\r\n`
  }
  rowXml += cellsXml + "</Row>\r\n";
  
  return rowXml;
}

const _writeRow = (writer) => (row, fields)=> {
  const rowXml = _generateXmlRow(row, fields)
  writer.write(rowXml)
}

const _writeSheetDataToFile = async (templateFilePath,  outputFilename, {getRowCountAsync, onDataWriteAsync}) => {
  const NEW_LINE_SYM = "\r\n"

  const POINTER_STATUS = {
    FIND_SHEET_NAME: "FIND_SHEET_NAME",
    FIND_START_TABLE_TAG: "FIND_START_TABLE_TAG",
    FIND_END_TABLE_TAG: "FIND_END_TABLE_TAG",
  }

  const mcTemplateWb = fs.readFileSync(templateFilePath, {encoding: 'utf8'})
  const lines = mcTemplateWb.split('\r\n')


  const writer = fs.createWriteStream(outputFilename)



  let poiterStatus = POINTER_STATUS.FIND_SHEET_NAME

  let currentSheetName = ""
  for(let line of lines) {

    switch(poiterStatus) {
      case POINTER_STATUS.FIND_SHEET_NAME: {
        const workSheetMatch = line.match(/<Worksheet.*ss:Name="(.*?)"/)
        if( workSheetMatch ) {
          currentSheetName = workSheetMatch[1]
          poiterStatus = POINTER_STATUS.FIND_START_TABLE_TAG
        }
        break
      }

      case POINTER_STATUS.FIND_START_TABLE_TAG: {
        const startTableTagMatch = line.match(/<Table.*ss:ExpandedRowCount="(.*?)"/)
        if(startTableTagMatch) {
          const tableExpandedRowCount = parseInt(startTableTagMatch[1])
          const rowCount = await getRowCountAsync(currentSheetName)
          line = line.replace(/ss:ExpandedRowCount=".*?"/, `ss:ExpandedRowCount="${rowCount + tableExpandedRowCount}"`)
          
          poiterStatus = POINTER_STATUS.FIND_END_TABLE_TAG
        }
        break
      }

      case POINTER_STATUS.FIND_END_TABLE_TAG: {
        const endTableTagMatch = line.match(/<\/.*Table/)
        if(endTableTagMatch) {
          // await new Promise(resolve => onDataWrite(writer, currentSheetName, resolve))
          await onDataWriteAsync(currentSheetName, _writeRow(writer))

          poiterStatus = POINTER_STATUS.FIND_SHEET_NAME

        }

        break
      }
    }
  
    writer.write(line + NEW_LINE_SYM)
  }

  writer.end()
  await new Promise(resolve => writer.on('close', resolve))

}



// ======================================================================================================
/**
 * 
 * @param {*} inputMcTemplatePath : String
 * @param {*} formDataExporter : {
 *  [sheetName] {
 *    sql: String
 *  }
 * }
 */
const executeExportDataToTemplate = async (ouputFilePath, inputMcTemplatePath, templateExporterNodeData, graph) => {

  const templateStructure = McTemplateService.loadMCTemplate(inputMcTemplatePath)
  const templateStructureWithSheetNameDict = templateStructure['sheets'].reduce((result, sheet) => {
    const {name} = sheet
    result[name] = sheet

    return result
  }, {}) 

  const {nodes} = graph
  let sheetSql = {}

  for(const mappingSheet of templateExporterNodeData['templateMappingSheets']) {
    const  {templateSheet: sheetName, queryTable: nodeCode, fields: fieldMappings} = mappingSheet
    try {
      if(nodeCode) {
        const node = nodes.find(node => node.data.code === nodeCode)
        const sql = await SqlGeneratorService.generateFullSql(node, graph) 
        // if(sql) {
          sheetSql[sheetName] = {
            sql: sql,
            mappingFieldDict: fieldMappings.reduce( (result, fieldMapping) => {
              const { queryField, templateField } = fieldMapping
              result[templateField] = queryField
              return result
            }, {})
          }
        // }
      }
      
    } catch (error) {
      console.log(error)
    }
  }
  

  await _writeSheetDataToFile(inputMcTemplatePath, ouputFilePath, {
    getRowCountAsync: async (sheetName) => {
      let count = 0
      const {sql} = sheetSql[sheetName] || {}
      if(sql) {
        try {
          count = await SqlExecutorService.getNumberOfRecords(sql)
        } catch (error) {
          console.error(error)
        }
      }
      return count
    }, 
    onDataWriteAsync: async (sheetName, write) => {
      const { sql, mappingFieldDict} = sheetSql[sheetName] || {}
      if(sql) {
        try {
          await SqlExecutorService.getAllRowsWithCallback(sql, 1000, (rows) => {
            for(const row of rows) {
              const fields = templateStructureWithSheetNameDict[sheetName]['fields']
              const mappedRow = _mappingRowField(row, mappingFieldDict)
              write(mappedRow, fields)
            }
          })
        } catch (error) {
          console.error(error)
        }
      }
    }})
}


export default {
  executeExportDataToTemplate
}