const xlsx = require("xlsx")
const fs = require("fs")
import { parse } from 'csv-parse';

onmessage = function (event) {

  const {filePath} = event.data
  const fileExtension = getFileExtension(filePath)
  switch(fileExtension.toLowerCase()) {
    case "csv": {
      readCsvFile(filePath, this)
      break;
    }
    case "xlsx": {
      readExcelFile(filePath, this)
      break;
    }
  }
}

const getFileExtension = (filePath) => {
  const filePaths = filePath.split(".")
  return filePaths[filePaths.length - 1]
}

// xlsx
const readExcelFile = (filePath, self) => {
  const excel = xlsx.readFile(filePath, {
    // cellText:false, 
    // cellDates:true
  })

  const sheet = excel.Sheets[excel.SheetNames[0]];
  const columnNames = getHeadersOfExcelSheet(sheet)
  const dataRows = xlsx.utils.sheet_to_json(sheet, { 
    raw: false
  });
  self.postMessage({
    columns: columnNames,
    rows: dataRows
  })
}

// csv
const readCsvFile = async (filePath, self) => {
  const fileData = fs.readFileSync(filePath, 'utf8')

  const parser = parse(fileData, {
    delimiter: ',',
    // columns : true,
    skip_empty_lines: true
  });

  let columns = []
  let rows = [];
  let rowCount = 0
  parser.on('readable', function(){
    let record;
    while ((record = parser.read()) !== null) {

      // first row is column
      if(rowCount === 0) {
        columns = record.map(col => col.trim())

      } else {
        const row = columns.reduce((result, columnName, i) => {
          result[columnName] = record[i]
          return result
        }, {})
        rows.push(row);
      }
      rowCount++
    }
  });
 
  parser.on('end', function(){
    self.postMessage({
      columns: columns,
      rows: rows
    })
  });

}


const getHeadersOfExcelSheet = (sheet) => {
  var headers = [];
  var range = xlsx.utils.decode_range(sheet['!ref']);
  var C, R = range.s.r; /* start in the first row */
  /* walk every column in the range */
  for(C = range.s.c; C <= range.e.c; ++C) {
      var cell = sheet[xlsx.utils.encode_cell({c:C, r:R})] /* find the cell in the first row */

      var hdr = "UNKNOWN " + C; // <-- replace with your desired default 
      if(cell && cell.t) hdr = xlsx.utils.format_cell(cell);

      headers.push(hdr);
  }
  return headers;
}