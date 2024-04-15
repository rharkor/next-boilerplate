/* eslint-disable @typescript-eslint/no-var-requires */
"use strict";

const path = require("path");

function sortPackageJson(packageJsonText) {
  const packageJson = JSON.parse(packageJsonText);
  let sortedPackageJson = packageJson;
  // Sort dependencies, devDependencies, and peerDependencies
  ["dependencies", "devDependencies", "peerDependencies"].forEach((key) => {
    if (packageJson[key]) {
      sortedPackageJson[key] = Object.fromEntries(
        Object.entries(packageJson[key]).sort()
      );
    }
  });
  const order = [
    "name",
    "version",
    "license",
    "private",
    "description",
    "scripts",
    "dependencies",
    "devDependencies",
    "peerDependencies",
  ];
  // Sort other keys
  sortedPackageJson = Object.fromEntries(
    Object.entries(sortedPackageJson).sort((a, b) => {
      // if a and b are not in order array, sort them by key
      if (!order.includes(a[0]) && !order.includes(b[0])) {
        return a[0].localeCompare(b[0]);
      }
      // If a is not in order array, sort a after b
      if (!order.includes(a[0])) {
        return 1;
      }
      // If b is not in order array, sort a before b
      if (!order.includes(b[0])) {
        return -1;
      }
      // Sort a and b by order array
      return order.indexOf(a[0]) - order.indexOf(b[0]);
    })
  );

  return JSON.stringify(sortedPackageJson, null, 2);
}

module.exports = {
  meta: {
    docs: {
      description: "Enforce package.json sorting",
    },
    fixable: "code",
    schema: [],
  },

  create(context) {
    const handleProgram = (node) => {
      const filename = context.getFilename();
      if (path.basename(filename) !== "package.json") {
        return {};
      }

      const sourceCode = context.sourceCode;
      const text = sourceCode.getText();

      const sortedPackageJsonText = sortPackageJson(text);

      if (sortedPackageJsonText !== text) {
        context.report({
          node,
          message: "Package.json is not sorted",
          fix(fixer) {
            return fixer.replaceText(sourceCode.ast, sortedPackageJsonText);
          },
        });
      }
    };

    return {
      Program: handleProgram,
    };
  },
};
