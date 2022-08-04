
// assign window if sequelize has run in webworker
if(typeof window != "object") self.window = self;

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
// const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require('/db/config/database.js')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

var context = require.context('.', true, /^(?!.*index).*\.js$/);
context.keys().forEach(fileName => {
  
  const moduleModel =  context(`${fileName}`).default || context(`${fileName}`)
  const model = moduleModel(sequelize, Sequelize.DataTypes);
  const modelName = model.name.split("_").map(e => e[0].toUpperCase() +  e.slice(1)).join("")
  db[modelName] = model;
})


Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sync = async () => {
  for(const modelName of Object.keys(db)) {
    if( typeof(db[modelName].sync) === 'function') {
      await db[modelName].sync()
    }
  }
}

db.sequelize = sequelize;
db.Sequelize = Sequelize;
module.exports = db;

// export default db;
