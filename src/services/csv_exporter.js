import SqlExecutor from "./sql_executor"
import * as CsvStringify from 'csv-stringify';
import fs from "fs"



const exportToCsv = async (executableSql, output, {onProgress}) => {
  let writeStream = fs.createWriteStream(output)
  writeStream.write("\uFEFF")
  const LIMIT = 500;


  const rowCount = await SqlExecutor.getNumberOfRecords(executableSql)
  const totalPage = rowCount % LIMIT === 0 ? parseInt(rowCount/LIMIT) : parseInt(rowCount/LIMIT) + 1

  // get columns
  const firstRows = await SqlExecutor.getRows(executableSql, 1, 1)
  let columns = []
  if(firstRows[0]) {
    columns = Object.keys(firstRows[0])
  }

  // retrieve data
  let rows = []
  let page = 1
  do {
    rows = await SqlExecutor.getRows(executableSql, page, LIMIT)

    const options = {
      header: page === 1 ,
      columns: columns 
    }
  
    await new Promise((resolve) => {
      CsvStringify.stringify(
        rows, options,
        (err, csvData) => {
          writeStream.write(csvData)
          resolve()
        }
      )
    })


    // update progress
    if(rows.length > 0) {
      onProgress && onProgress((page)*100/totalPage)
    }

    page++
    await new Promise(resolve => setTimeout(resolve, 100))
  }while(rows.length > 0)

  writeStream.end()
  await new Promise((resolve) => writeStream.on("finish", resolve) )


}

export default {
  exportToCsv
}