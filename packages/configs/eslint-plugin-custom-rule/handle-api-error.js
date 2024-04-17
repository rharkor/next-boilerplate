"use strict";

module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: "await/return ApiError because it's a promise",
      category: "Best Practices",
      recommended: false,
    },
    schema: [], // no options
  },
  create: function (context) {
    const handleProgram = (node) => {
      const sourceCode = context.sourceCode;
      const text = sourceCode.getText();

      const apiErrorRegex = new RegExp(/(\w*)\s+ApiError\(/, "g");
      const prefixMatch = ["await", "return", "function"];

      let match;
      while ((match = apiErrorRegex.exec(text))) {
        const captured = match[1];
        if (!prefixMatch.includes(captured)) {
          const matchIndex = match.index;
          const matchLength = match[0].length;

          // Get position information based on regex match index
          const startLoc = sourceCode.getLocFromIndex(matchIndex);
          const endLoc = sourceCode.getLocFromIndex(matchIndex + matchLength);

          const loc = {
            start: {
              line: startLoc.line,
              column: startLoc.column,
            },
            end: {
              line: endLoc.line,
              column: endLoc.column,
            },
          };

          context.report({
            node,
            message: `Use 'await' or 'return' with ApiError because it's a promise`,
            loc,
          });
        }
      }
    };

    return {
      Program: handleProgram,
    };
  },
};
