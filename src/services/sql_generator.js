import GraphService from "./graph"
import {ImportedTable, ImportedTableField} from "@/models"
import CONSTANTS from "@/constants"


const { QUERY_CONSTANT, NODE_CONSTANT } = CONSTANTS


const _getPhysicalTableName = async (logicalTableName) => {
  const importedTable = await ImportedTable.findOne({
    where: {
      logicalTableName: logicalTableName
    }
  })

  return importedTable && importedTable['physicalDbName']
}




/**
 * 
 * @param {*} select 
 * @returns 
 * 
 * type TABLE_FIELD{
 *    table: String,
 *    field: String,
 *    alias: String,
 *    type: ENUM : QUERY.SELECT.TYPE => QUERY.SELECT.TYPE.TABLE_FIELD
 * }
 * type AGGREGATE{
 *  value: String,
 *  alias: String,
 *  type: ENUM : QUERY.SELECT.TYPE => QUERY.SELECT.TYPE.AGGREGATE
 *} 
 */
const _generateSelect = (selectedNode, physicalTableName) => {
  const data = selectedNode['data']
  const {select, type} = data
  
  let selectStatement = "SELECT "
  selectStatement += select.map(e => {
    
    switch(e['type']) {
      case QUERY_CONSTANT.SELECT.TYPE.TABLE_FIELD: {
        
        let tableName = e['table']
        if(type === NODE_CONSTANT.TYPE.TABLE) {
          tableName = physicalTableName
        }

        return `[${tableName}].[${e['field']}] AS [${e['alias']}]`
      }
      case QUERY_CONSTANT.SELECT.TYPE.AGGREGATE: {
        return `(${e['value']}) AS [${e['alias']}]`
      }
    }

    return ""
  }).join(",\r\n")

  return selectStatement + " "
}


const _generateFrom = async ( selectedNode, nodes, edges, nearestSourceNodes, physicalTableName) => {

  const {from, type} = selectedNode.data

  let formClauseSql = " FROM "
  if(type === NODE_CONSTANT.TYPE.TABLE) {
    formClauseSql += ` [${physicalTableName}] `

  } else {
    const {code} = from 
    const queryNode = nearestSourceNodes.find(node => node['data']['code'] === code)
    if(queryNode) {
      const subquery = await _generateFullSqlRecur(queryNode, nodes, edges)
      formClauseSql += " ( " + subquery + " ) AS " + queryNode['data']['code']
    }
  }
  return formClauseSql
}

const _generateJoin = async (selectedNode, nodes, edges, nearestSourceNodes) => {
  const {join} = selectedNode.data

  let joinClauseSql = ""
  if(join && join['sources']) {
    for(const source of join['sources']) {
      const {code} = source
      const queryNode = nearestSourceNodes.find(node => node['data']['code'] === code)
      
      if(queryNode) {
        joinClauseSql += " " + source['type'] + " "
        joinClauseSql += " ( " + await _generateFullSqlRecur(queryNode, nodes, edges) + " ) AS " +  queryNode['data']['code'] + " "

        if(source['on'] && source['on'].length > 0) {
          
          let joinConditionSql = ""
          const joinConditions = source['on'].map(onCondition => {
            const field1Sql = onCondition.field1.map(f => `[${f}]`).join(".")
            const field2Sql = onCondition.field2.map(f => `[${f}]`).join(".")

            if(field1Sql && field2Sql) {
              return field1Sql + " = " + field2Sql 
            }

            return ""
          })

          if(joinConditions.join('').trim().length > 0) {
            joinConditionSql += " ON "  + joinConditions.filter(e => !!e).join(" AND ") + " "
          }

          joinClauseSql +=  joinConditionSql

        }
      }
    }
  }

  return joinClauseSql

}


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
const _generateWhereClause = (selectedNode) => {
  const { where } = selectedNode.data

  if(where) {
    return " WHERE " + _generateWhereRecur(where)
  }

  return ""
}


const _generateWhereRecur = (where) => {
  let whereClase = ""
  if( where ) {
    const { type } = where
    if(QUERY_CONSTANT.WHERE.TYPE.GROUP === type) {
      const {subConditions, operator} = where
      let sqls = []
      for(const subCondition of subConditions) {
        if(subCondition['type'] === QUERY_CONSTANT.WHERE.TYPE.GROUP) {
          sqls.push(" ( " + _generateWhereRecur(subCondition) + " ) " )

        } else {
          sqls.push(" " + _generateWhereRecur(subCondition) + " " )

        }
      }

      whereClase += sqls.join(" " + operator + " ")
 
    } else if (QUERY_CONSTANT.WHERE.TYPE.ITEM === type) {
      const { op, param1, param2 } = where

      let param1Sql = param1.map(val => `[${val}]`).join(".")
      let param2Sql = ""

      if([QUERY_CONSTANT.WHERE.OP.BETWEEN, QUERY_CONSTANT.WHERE.OP.NOT_BETWEEN].includes(op.toUpperCase())) {
        param2Sql = ` ${param2.value[0]} AND ${param2.value[1]} `

      } else if( [QUERY_CONSTANT.WHERE.OP.IN, QUERY_CONSTANT.WHERE.OP.NOT_IN].includes( op.toUpperCase()) ) {
        param2Sql = ` (${param2.value.join(",")}) `
      
      } else {

        if(QUERY_CONSTANT.WHERE.PARAM_TYPE.TABLE_FIELD === param2.valueType) {
          param2Sql = param2.value.map(val => `[${val}]`).join(".")

        } else {
          param2Sql = `'${param2.value[0]}'`
        }

      }
    
      whereClase += ` ${param1Sql} ${op} ${param2Sql}` 
      

    }

    
  }


  return whereClase


}

/**
 * 
 * @param {*} selectedNode 
 * 
 * @order : {
 *   orderFields: [
 *    {
 *      field: "", this include table's column name, alias
 *      op: ""
 * 
 *    }
 *   ]
 * }
 */
const _generateOrderByClause = (selectedNode) => {
  let orderClause = ""
  const { orderBy } = selectedNode.data
  if(orderBy?.length > 0) {
    orderClause = " ORDER BY "
    let orderClauses = []
    for( const orderField of orderBy) {
      const {table, field, op} = orderField
      orderClauses.push(`[${table}].[${field}] ${op || ''}`)
    }

    orderClause += orderClauses.join(", ")
  }

  return orderClause
}

const _generateFullSqlRecur = async (selectedNode, nodes, edges) => {

  let query = selectedNode.data

  

  const {
    select,
    from,
    join,
    where,
    having,
    groupBy,
    type
  } = query
  let sql = `\r\n ` 


  let physicalTableName = ""
  if(query['type'] === NODE_CONSTANT.TYPE.TABLE) {
    physicalTableName = await _getPhysicalTableName(from['code'])
  }

  // ======================================= generate SELECT 
  sql += _generateSelect(selectedNode, physicalTableName)
  
  const nearestSourceNodes = GraphService.getNearestSourceNodesByNodeEdge(selectedNode, nodes, edges)
  
  sql += await _generateFrom( selectedNode, nodes, edges, nearestSourceNodes, physicalTableName)
  sql += await _generateJoin( selectedNode, nodes, edges, nearestSourceNodes)

  sql += _generateWhereClause(selectedNode)

  sql += _generateOrderByClause(selectedNode)

  return sql
}



const generateFullSql = async (selectedNode, graph) => {

  const { edges, nodes} = graph 
  


  const isCycle = GraphService.isExistCycle(nodes, edges)
  if(!isCycle) {
    return await _generateFullSqlRecur(selectedNode, nodes, edges)
  }
  return ""
}

export default {
  generateFullSql
}

