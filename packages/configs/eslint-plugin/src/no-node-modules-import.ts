import type { Rule } from "eslint"

const rule: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description: "disallow relative import of node_modules",
      category: "Best Practices",
      recommended: false,
    },
    schema: [], // no options
  },
  create: function (context) {
    const handleProgram = () => {
      const sourceCode = context.sourceCode

      const importNodes = sourceCode.ast.body.filter((node) => node.type === "ImportDeclaration")
      //* Check if match /node_modules\/.*/
      importNodes.forEach((importNode) => {
        if (
          importNode.source.value &&
          typeof importNode.source.value === "string" &&
          importNode.source.value.match(/node_modules\/.*/)
        ) {
          context.report({
            node: importNode,
            message: "Do not import from node_modules",
          })
        }
      })
    }

    return {
      Program: handleProgram,
    }
  },
}

export default rule
