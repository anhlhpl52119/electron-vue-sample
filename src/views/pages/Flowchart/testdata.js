const tb1 = {
  "select": "SELECT *",
  "from": {
    "code": "table_1"
  },
  "code": "tb1",
  "type": "table"
}

const tb2 = {
  "select": "SELECT *",
  "from": {
    "code": "table_2"
  },
  "code": "tb2",
  "type": "table"
}

const qr1 = {
  "select": "SELECT *",
  "from": {
    "code": "tb1"
  },
  "code": "qr1"
}

const qr2 = {
  "select": "SELECT *",
  "from": {
    "code": "tb2"
  },
  "code": "qr2"
}

const finalNode = {
  "select": "SELECT asd.*",
  "from": {
    "code": "qr1"
  },
  "join": {
    "sources": [
      {
        "type": "INNER JOIN",
        "code": "tb1",
        "on": "qr1.id = tb1.id"
      },
      {
        "type": "LEFT JOIN",
        "code": "qr2",
        "on": "qr1.id = qr2.id"
      }
    ]
  },
  "code": "bigboi"
}