import { sequelize, Sequelize } from "@/models"

const _executeSql = async (executableSql, rawSql) => {
  let rows = []
  try {

    rows = await sequelize.query(executableSql, {
      type: Sequelize.QueryTypes.SELECT
    })

  } catch (_) {
    await sequelize.query(rawSql, {
      type: Sequelize.QueryTypes.SELECT
    })
  }
  
  return rows
}




/**===================================================================================================== */
const getRows = async (executableSql, page = 1, pageSize = 10) => {
  if(!executableSql) return []
  
  let pagingExecutableSql = `SELECT * FROM (${executableSql}) LIMIT ${pageSize} OFFSET ${(page-1) * pageSize}`

  const rows = await _executeSql(pagingExecutableSql, executableSql)
  return rows
}

const getAllRowsWithCallback = async (executableSql, pageSize = 10, callback) => {
  let page = 1
  let rows = []

  do {
    rows = await getRows(executableSql, page, pageSize)
    
    if(rows.length > 0) {
      await callback(rows)
    }
    
    page++
  }while(rows.length > 0)

}


const getNumberOfRecords = async (executableSql) => {
  if(!executableSql) return 0

  let countExecutableSql = `SELECT COUNT(*) AS COUNT FROM (${executableSql}) `
  const rows = await _executeSql(countExecutableSql, executableSql)
  return rows[0]['COUNT']
}

export default {
  getRows,
  getNumberOfRecords,
  getAllRowsWithCallback
}