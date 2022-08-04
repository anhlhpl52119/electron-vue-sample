import { ImportedTable, sequelize, ImportedTableField, Sequelize} from "@/models";
const xlsx = require("xlsx")
const { QueryTypes } = require("sequelize");
import ExcelReaderWorker from "worker-loader?filename=[contenthash].[name].js!@/workers/excel_reader.worker.js"
const IMPORTED_TABLE_NAME_PREFIX = "imported_table"


export const fetchImportedTable = async () => {
  const dbImportedTable = await ImportedTable.findAll();
  return dbImportedTable;
};

export const checkTableNameImportedTable = async (value) => {
  const dbMigrationObj = await ImportedTable.findOne({
    where: {
      logicalTableName: value,
    },
  });
  return dbMigrationObj;
};

export const createImportedTable = async (oImportedTable) => {
  const dbImportedTable = await ImportedTable.create(oImportedTable);
  return dbImportedTable;
};

export const removeImportedTableRecord = async (oImportedTable) => {
  const oTableDelete = await sequelize.query(
    `SELECT * FROM imported_tables where id=${oImportedTable.id}`,
    {
      type: QueryTypes.SELECT,
    }
  );
  const queryInterface = sequelize.getQueryInterface();
  await queryInterface.dropTable(oTableDelete[0].physicalDbName);

  await ImportedTable.destroy({
    where: {
      id: oImportedTable.id,
    },
  });
};


export const createImportedTableListData = async (oTableInfo) => {
  try {
    const queryInterface = sequelize.getQueryInterface();
    const oResult = await queryInterface.bulkInsert(
      oTableInfo.sName,
      oTableInfo.results
    );
    // const users = await sequelize.query(`SELECT * FROM imported_tables`, {
    //     type: QueryTypes.SELECT
    // });
    return oResult;
  } catch (error) {
    console.log(error);
  }
};

// Create a table in database programmatically
export const importTemplateTable = (oTableInfo) => {
  const uniqueTableName = oTableInfo.sName;
  sequelize
    .define(uniqueTableName, oTableInfo.oStruture, {
      sequelize: sequelize,
      freezeTableName: true,
    })
    .sync();
};

export const showTempTableRecord = async (tableName) => {
  const oTableDelete = await sequelize.query(`SELECT * FROM [${tableName}]`, {
    type: QueryTypes.SELECT,
  });
  return oTableDelete;
};

//Helpper Dynamic Column
const actionConfig = {
  filterDropdown: "filterDropdown",
  filterIcon: "filterIcon",
  customRender: "customRender",
};

export const DynamicColumn = (dataValues) => {
  const valueHeader = Object.keys(dataValues).filter(
    (e) => e !== "createdAt" && e !== "updatedAt"
  );
  const valueColumnsModal = valueHeader.map((value) => {
    return {
      title: value,
      dataIndex: value,
      key: value,
      width: 170,
      sorter: (a, b) =>
        isNaN(a[value])
          ? a[value] > b[value]
            ? 1
            : b[value] > a[value]
            ? -1
            : 0
          : a[value] - b[value],
      slots: actionConfig,
      onFilter: (valueParam, record) =>
        record[value]
          .toString()
          .toLowerCase()
          .includes(valueParam.toLowerCase()),
    };
  });
  return valueColumnsModal;
};


export const validateFileData = async (filePath) => {
  const dataTableExcelLoadWorker = new ExcelReaderWorker();
  dataTableExcelLoadWorker.postMessage({ filePath });

  // dataTableExcelLoadWorker.onmessage = function (event) {};
  const { rows, columns } = await new Promise((resolve) => {
    dataTableExcelLoadWorker.addEventListener("message", async (mess) => {
      const { rows, columns } = mess.data;

      resolve({
        rows,
        columns,
      });
    });
  });

  const invalidMessages = validateSheetData(columns, rows);
  return invalidMessages;
};

export const createImportedTableData = async (filePath, logicalTableName, description ) => {
  // const fileData = fs.readFileSync(filePath)
  // const excel = xlsx.readFile(filePath, {
    // cellText:false, 
    // cellDates:true
  // })
  // const sheet = excel.Sheets[excel.SheetNames[0]];
  // const columnNames = getHeadersOfSheet(sheet)
  // const dataRows = xlsx.utils.sheet_to_json(sheet, { 
  //   raw: false
  // });
 
  const dataTableExcelLoadWorker = new ExcelReaderWorker()
  dataTableExcelLoadWorker.postMessage({ filePath })
 
  // dataTableExcelLoadWorker.onmessage = function (event) {};
  const {rows, columns} = await new Promise(resolve => {
    dataTableExcelLoadWorker.addEventListener( "message", async (mess) => {
      const {rows, columns} = mess.data
      
      resolve({
        rows, 
        columns
      })


    })
  })
  
  const invalidMessages = validateSheetData(columns , rows)

  if(invalidMessages.length > 0) {
    throw {type: 'SHEET_INVALID', messages: invalidMessages}
  }

  const physicalTableName = await generateImportedDataTable(logicalTableName, columns)
  const importedTableData = {
    logicalTableName,
    filePath,
    physicalTableName,
    description
  }

  await createImportedTableAndFields(importedTableData, columns)
  
  
  await bulkInsertIntoTempImportedDataTable(physicalTableName, rows)

}



export const queryImportedTableDataById = async (id) => {
  const importedTable = await ImportedTable.findOne({
    where: {id: id},
  })

  const sql = `SELECT * FROM [${importedTable['physicalDbName']}]`
  return sequelize.query(sql, {
    raw: true,
    type: Sequelize.QueryTypes.SELECT
  })
}


export const queryImportedTableFieldById = async (id) => {
  const importedTableField = await ImportedTableField.findAll({
    where: {importedTableId: id},
    raw: true
  })
  return importedTableField
}

export const updateImportedTable = async (id, data) => {
  await ImportedTable.update(data, {
    where: {
      id: id,
    },
  });
}

// private
const createImportedTableAndFields = async (importedTableData, columnNames) => {

  const importedTable = await ImportedTable.create({
    logicalTableName: importedTableData['logicalTableName'],
    importedFilePath: importedTableData['filePath'],
    physicalDbName: importedTableData['physicalTableName'],
    description: importedTableData['description'],
    createdAt: Date.now(),
    updatedAt: Date.now()
  })

  const records = columnNames.map((columnName, index) => {
    return {
      importedTableId: importedTable.id,
      fieldName: columnName,
      order: (index+1),
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
  })
  
  await ImportedTableField.bulkCreate(records)


}


const bulkInsertIntoTempImportedDataTable = (physicalTableName, rows) => {

  const queryInterface = sequelize.getQueryInterface()
  return queryInterface.bulkInsert(
    physicalTableName,
    rows,
    {validate: false} 
  )
}





/**
 * 
 * @param {*} tableName 
 * @param {*} tableStructure 
 * @returns 
 * @desc Create database table dynamically
 */
const generateImportedDataTable = async (tableName, attributes) => {
  const randomNumberStr = Date.now()
  const tableStructure = attributes.reduce((result, attribute)=> {
    result[attribute] = {
      type: Sequelize.STRING
    }
    return result
  }, {})
  const uniqueTableName = `${randomNumberStr}_${IMPORTED_TABLE_NAME_PREFIX}_${tableName}`
  await sequelize.define(uniqueTableName, 
      tableStructure,
    {
      timestamps: false,
      sequelize: sequelize,
      freezeTableName: true
    }
  ).sync()
  return uniqueTableName
}


const validateSheetData = (columns, rows) => {
  const errorMessages = []
  // check duplicate column
  let duplicateColumns = []
  for(let i = 0; i < columns.length; i++) {
    for(let j = i + 1; j < columns.length; j++) {
      if(columns[i] === columns[j]) {
        duplicateColumns.push(columns[i])
        errorMessages.push(`'${columns[i]}' duplicated column name`)
        break
      }
    }
  }

  // check escape char in column
  for(let column of columns) {
    if(column.match(/(\r?\n|\\|\/)/) ) {
      errorMessages.push(`Column '${column}' has invalid character `)

    }
  }
  return errorMessages
}