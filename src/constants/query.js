export default {
  SELECT: {
    TYPE: {
      TABLE_FIELD: "TABLE_FIELD",
      AGGREGATE: "AGGREGATE" 
    }
  },
  JOIN: {
    JOIN_TYPE: {
      INNER_JOIN: "INNER JOIN",
      LEFT_JOIN: "LEFT JOIN",
      RIGHT_JOIN: "RIGHT JOIN",
      FULL_JOIN: "FULL JOIN"
    }
  },
  WHERE: {
    TYPE: {
      GROUP: "GROUP",
      ITEM: "ITEM"
    },
    OP: {
      BETWEEN: "BETWEEN",
      NOT_BETWEEN: "NOT BETWEEN",
      IN: "IN",
      NOT_IN: "NOT IN",
      LIKE: "LIKE",
      IS: "IS",
      EQ: "=",
      NEQ: "<>",
      GT: ">",
      GTE: ">=",
      LT: "<",
      LTE: "<=",
    },
    PARAM_TYPE: {
      TABLE_FIELD: "TABLE FIELD", 
      INPUT: "INPUT"
    }
  },
  ORDER: {
    OP: {
      ASC: "ASC",
      DESC: "DESC",
    }
  }
}