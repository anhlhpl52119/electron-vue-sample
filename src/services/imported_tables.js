
import {ImportedTable, ImportedTableField} from "@/models"

export default {
  getAll: () => {
    return ImportedTable.findAll({raw: true})
  },

  getImportTableFields: (importedTableId) => {
    return ImportedTableField.findAll({
      where: {
        importedTableId
      },
      raw: true
    })
  },

  getAllWithFields: async () => {
    let rows = await ImportedTable.findAll({
      include: {
        model: ImportedTableField
      },
      // raw: true
    })

    return rows.map(row => {
      return {
        ...row.dataValues,
        imported_table_fields: row.dataValues.imported_table_fields.map(imported_table_field => imported_table_field.dataValues)
      }
    })
  }
}