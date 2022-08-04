'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class imported_table extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.ImportedTableField)
    }
  };
  imported_table.init({
    logicalTableName: DataTypes.STRING,
    importedFilePath: DataTypes.STRING,
    physicalDbName: DataTypes.STRING,
    description: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'imported_table',
  });
  return imported_table;
};