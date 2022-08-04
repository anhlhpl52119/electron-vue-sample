const treeData = {
  type: "GROUP",
  operator: OR,
  subConditions: [
    {
      type: "GROUP",
      operator: AND,
      subConditions: [
        {
          type: "ITEM",
          params1: "tb1.f1",
          params2: ["tb2.f1"],
          op: "=",
        },
        {
          type: "GROUP",
          operator: OR,
          subConditions: [
            {
              type: "ITEM",
              params1: "tb1.f2",
              params2: ["tb3.f1"],
              op: "=",
            },
            {
              type: "ITEM",
              params1: "tb1.f3",
              params2: ["tb5.f1"],
              op: "=",
            },
          ],
        },
      ],
    },
    {
      type: "ITEM",
      params1: "tb1.f5",
      params2: ["tb5.f1"],
      op: "=",
    },
  ],
};
export default treeData;
