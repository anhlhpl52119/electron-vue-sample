/**
 * This file will not be executed
 * This file is for document purpose only
 */

// Node

// ========================================= SELECT
enum QUERY_SELECT_TYPE_ENUM {
  TABLE_FIELD =  "TABLE_FIELD",
  AGGREGATE =  "AGGREGATE"
}


interface SelectClause {

  alias: String,
  type: QUERY_SELECT_TYPE_ENUM
}

interface SelectClauseTableField extends SelectClause {
  table: String,
  field: String,
  type: QUERY_SELECT_TYPE_ENUM.TABLE_FIELD
}

interface SelectClauseAggregate extends SelectClause {
  value: String,
  type: QUERY_SELECT_TYPE_ENUM.AGGREGATE
}


// ========================================== Join Clause
enum JOIN_TYPE {
INNER_JOIN, LEFT_JOIN, RIGHT_JOIN, OUTTER_JOIN, JOIN
}

interface OnStatement {
  field1: String[],
  field2: String[]
}
interface JoinSource {
  type: JOIN_TYPE,
  code: String, // code of join table/ query
  on: OnStatement[] 
}

interface JoinClause {
  sources: JoinSource[]
}


// ==================================== where clause
enum WHERE_CLAUSE_OPERATOR_TYPE_ENUM {
  OR, AND
}

enum WHERE_CLAUSE_COMPARABLE_OPERATION_TYPE_ENUM {
  BETWEEN = "BETWEEN",
  NOT_BETWEEN = "NOT BETWEEN",
  IN = "IN",
  NOT_IN = "NOT IN",
  LIKE = "LIKE",
  IS = "IS",
  EQ = "=",
  NEQ = "<>",
  GT = ">",
  GTE = ">=",
  LT = "<",
  LTE = "<=",
}

enum WHERE_CLAUSE_TYPE_ENUM {
  GROUP = "GROUP",
  ITEM = "ITEM"
}

interface WhereClause {
  type: WHERE_CLAUSE_TYPE_ENUM,
  
}

interface WhereClauseGroup extends WhereClause {
  type: WHERE_CLAUSE_TYPE_ENUM.GROUP,
  operator: WHERE_CLAUSE_OPERATOR_TYPE_ENUM,
  subConditions: WhereClause[]

}

enum WHERE_CLAUSE_PARAM_TYPE  {
  TABLE_FIELD = "TABLE_FIELD", 
  INPUT= "INPUT"
}
interface WhereClauseItem extends WhereClause {
  type: WHERE_CLAUSE_TYPE_ENUM.ITEM,
  param1: String[], // table and field or alias
  param2: {
    valueType: WHERE_CLAUSE_PARAM_TYPE
    value: String[]
  }, // Array of table.field or hardcoded value, ex: ['tb1.f1', 'tb2.f2', 'qweweq']
  op: WHERE_CLAUSE_COMPARABLE_OPERATION_TYPE_ENUM

}



// ===================================== QUERY ORDER
enum ORDER_CLAUSE_ORDER_OPERATOR_ENUM {
  ASC = "ASC",
  DESC = "DESC",
}

interface OrderClause {
  field: String,
  table: String,
  op: ORDER_CLAUSE_ORDER_OPERATOR_ENUM
}

// ============================= Data node
enum NODE_DATA_TYPE_ENUM {
  TABLE = "table",
  QUERY = "query",
  EXPORT_TO_TEMPLATE = "EXPORT_TO_TEMPLATE" 
}

interface DataNode {
  code: String,
  type: NODE_DATA_TYPE_ENUM

}

// Node
interface DataTable extends DataNode{

}

interface DataTableNode extends DataTable{
  type: NODE_DATA_TYPE_ENUM.TABLE

  select: SelectClause,
  from: {
    code: String // table name
  }
}

interface QueryNode extends DataTable{
  type: NODE_DATA_TYPE_ENUM.QUERY

  select: SelectClause,
  from: DataTable,
  join: JoinClause,
  where: WhereClause,
  orderBy: OrderClause[]
  // having
  // groupBy

}


// Template Node
type McTemplateSheet = {
  name: String
  mandatory: Boolean
  fields: McTemplateField[]
}

type McTemplateField = {
  groupName: String,
  fieldDescr: String,
  mandatory: Boolean,
  type: String,
  length: Number,
  decimal: Number,
  sapTable: String,
  sapField: String,
}

type FieldMapping = {
  attr: McTemplateField,
  templateSheet: String,
  templateField: String,
  queryField: String
}

interface TemplateMappingSheet {
  templateSheet: String,
  queryTable: String,
  fields: FieldMapping[]
}

interface TemplateExporter extends DataNode{
  type: NODE_DATA_TYPE_ENUM.EXPORT_TO_TEMPLATE
  mcTemplatePath: String,
  templateMappingSheets: TemplateMappingSheet[]
}


// const a = _generateWhereClause({
//   data: {
//     where: {
//       type: "GROUP",  
//       operator: "OR",
//       subConditions: [
//         { 
//           type: "GROUP",  
//           operator: "AND",
//           subConditions: [
//             {
//               type: "ITEM",
//               param1: "tb1.f1",
//               param2: ["tb2.f1"],
//               op: "="
//             },
//             {
//               type: "GROUP", 
//               operator: "OR",
//               subConditions: [
//                 {
//                   type: "ITEM",
//                   param1: "tb1.f2",
//                   param2: ["tb3.f1"],
//                   op: "="
//                 },
//                 {
//                   type: "ITEM",
//                   param1: "tb1.f3",
//                   param2: ["tb5.f1"],
//                   op: "="
//                 }
//               ]
//             }
//           ]
//         }, {
//           type: "ITEM",
//           param1: "tb1.f5",
//           param2: ["tb5.f1"],
//           op: "="
//         }
//       ]
//     }
//   }
// })
// console.log("-============================================")
// console.log(a)
// (() => {
//   table = ({sql, alias}) => {

//   }






//   const JoinSource = {
//     type: "INNER JOIN",
//     query: FromSource,
//     on: "asd.id = jj1.id"
//   }



//   const jj1 = {
//     select: "SELECT *",
//     from: {
//       name: "qwe"
//     },
//     join: {},
//     where: {},
//     having: {},
//     groupBy: {},
//     orderBy: {},
//     name: "jj1",
//     type: "table"
//   }


  // const jj22_2 = {
  //   select: "SELECT *",
  //   from: {
  //     code: "qwe2222"
  //   },
  //   join: {},
  //   where: {},
  //   having: {},
  //   groupBy: {},
  //   orderBy: {},
  //   code: "jj22_2",
  //   type: "table"
  // }

  // const jj2 = {
  //   select: "SELECT *",
  //   from: {
  //     code: "jj22_2"
  //   },
  //   join: {},
  //   where: {},
  //   having: {},
  //   groupBy: {},
  //   orderBy: {},
  //   code: "jj2",
  //   type: "query",

  // }



//   const asd = {
//     select: "SELECT *",
//     from: {
//       code: "wtf"
//     },
//     join: {},
//     where: {},
//     having: {},
//     groupBy: {},
//     orderBy: {},
//     code: "asd",
//     type: "table"
//   }

  // const objs = {
  //   select: "SELECT asd.*",
  //   from: {
  //     code: "asd"
  //   },
  //   join: {
  //     sources: [
  //       {
  //         type: "INNER JOIN",
  //         // sql: "SELECT * FROM J1",
  //         code: "jj1",
  //         on: "asd.id = jj1.id"
  //       },
  //       {
  //         type: "LEFT JOIN",
  //         // sql: "SELECT * FROM J2",
  //         code: "jj2",
  //         on: "asd.id = jj2.id"
  //       }
  //     ]
  //   },
  //   code: "zzzzzz",
  // }

//   const result = generateSqlFromQueryComponent(objs)
//   console.log(result)
// })()


 
// WHERE tb1.f1 = tb2.f1 AND (tb1.f2 = tb2.f2 OR tb1.f3 = tb3.f1) OR tb1.f5 = tb5.f1
// <=> WHERE (tb1.f1 = tb2.f1 AND (tb1.f2 = tb2.f2 OR tb1.f3 = tb3.f1) ) OR tb1.f5 = tb5.f1

// const WHERE = 
// {
//   type: "GROUP",  
//   operator: OR,
//   subConditions: [
//     { 
//       type: "GROUP",  
//       operator: AND,
//       subConditions: [
//         {
//           type: "ITEM",
//           param1: "tb1.f1",
//           param2: ["tb2.f1"],
//           op: "="
//         },
//         {
//           type: "GROUP", 
//           operator: OR,
//           subConditions: [
//             {
//               type: "ITEM",
//               param1: "tb1.f2",
//               param2: ["tb3.f1"],
//               op: "="
//             },
//             {
//                type: "ITEM",
//               param1: "tb1.f3",
//               param2: ["tb5.f1"],
//               op: "="
//             }
//           ]
//         }
//       ]
//     }, {
//       type: "ITEM",
//       param1: "tb1.f5",
//       param2: ["tb5.f1"],
//       op: "="
//     }

//   ]
// }