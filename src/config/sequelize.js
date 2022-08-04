var sqlite3 = require('sqlite3').verbose();

const { Sequelize, Model, DataTypes } = require('sequelize');

const db = new Sequelize("mydb", null, null, {
  dialectModule: sqlite3,
  dialect: 'sqlite',
  // storage: ":memory:"
  storage:  "sql.db"
});

export default db