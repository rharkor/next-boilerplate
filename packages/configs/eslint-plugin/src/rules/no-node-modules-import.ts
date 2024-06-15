import { Rule } from "eslint";

const nodeModuleRegex = /node_modules\/.*/;

export const rule: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow relative import of node_modules",
    },
    schema: [],
    messages: {
      noNodeModulesImport: "Do not import from node_modules",
    },
  },
  create: function (context) {
    return {
      ImportDeclaration: (node) => {
        //* Check if match /node_modules\/.*/
        const source = node.source.value?.toString();
        if (source && nodeModuleRegex.test(source)) {
          context.report({
            node,
            messageId: "noNodeModulesImport",
          });
        }
      },
    };
  },
};
