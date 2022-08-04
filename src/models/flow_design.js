'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class FlowDesign extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  FlowDesign.init({
    name: DataTypes.STRING,
    diagramStructure: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'flow_design',
  });
  return FlowDesign;
};