var sqlite3 = require('sqlite3').verbose();


module.exports = {
  "development": {
    "dialectModule": sqlite3,
    "dialect":"sqlite",
    // storage: ":memory:"
    "storage":  "db/data/dev.db"
  }
  // ,
  // "test": {
  //   "username": "root",
  //   "password": null,
  //   "database": "database_test",
  //   "host": "127.0.0.1",
  //   "dialect": "mysql"
  // },
  ,"production": {
    "dialectModule": sqlite3,
    "dialect":"sqlite",
    // storage: ":memory:"
    // "storage":  "db/data/prod.db"
    "storage":  "prod.db"
  }
}
