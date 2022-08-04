import ImportedTableService from "@/services/imported_tables"

export default {
  namespaced: true,
  state: () => ({
    importedTables: [],

  }),

  mutations: {
    
  },

  actions: {
    async loadImportedTables({state}){
      const importedTables = await ImportedTableService.getAllWithFields()
      state.importedTables = importedTables
    }
  }
}