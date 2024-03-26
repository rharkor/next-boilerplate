"use strict";

module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: "disallow 'use client' in page or layout files",
      category: "Best Practices",
      recommended: false,
    },
    schema: [], // no options
  },
  create: function (context) {
    const handleProgram = (node) => {
      const sourceCode = context.getSourceCode();
      const filename = context.getFilename();
      const firstLine = sourceCode.lines[0].trim();

      // Check if the file is a page or layout file
      const isTargetedFile = /(?:page|layout)\.(ts|tsx|js|jsx)$/.test(filename);

      // If it's the targeted file type and the first line is 'use client'
      if (isTargetedFile && firstLine === '"use client"') {
        context.report({
          node,
          message: "'use client' is not allowed in page or layout files.",
        });
      }
    };

    return {
      Program: handleProgram,
    };
  },
};
