/**
 * This script is intended to run only once at the beginning of the project
 * It will replace all tokens in the project with the user's input
 */

import chalk from "chalk";
import { execSync } from "child_process";
import * as fs from "fs";
import { glob } from "glob";
import inquirer from "inquirer";
import * as path from "path";
import * as url from "url";

import { logger } from "@next-boilerplate/lib";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

const filesCache: Record<string, string> = {};

export const replaceTokens = async () => {
  const tokens: { message: string; token: string; id: string }[] = [
    {
      message: "What is the project name?",
      id: "PROJECT_NAME",
      token: "next-boilerplate",
    },
  ];
  const answers = await inquirer.prompt(
    tokens.map((token) => ({
      type: "input",
      name: token.id,
      message: token.message,
      validate: (input) => {
        // Slug
        if (token.id === "PROJECT_NAME") {
          if (!/^[a-z0-9-]+$/.test(input))
            return "The project name must be a slug";
        }
        return true;
      },
    }))
  );
  const tokensWithAnswers = tokens.map((token) => ({
    ...token,
    answer: answers[token.id],
  }));

  //? Replace all tokens in the files
  for (const token of tokensWithAnswers) {
    //? Replace in all files
    // Function to replace text in a file
    const search = token.token;
    const value = token.answer;
    async function replaceTextInFile(filePath: string) {
      const getFileContent = async () => {
        if (filesCache[filePath]) return filesCache[filePath];
        const content = await fs.promises.readFile(filePath, "utf8");
        filesCache[filePath] = content;
        return content;
      };
      const content = await getFileContent();
      if (content.includes(search)) {
        const replacedContent = content.replaceAll(search, value);
        await fs.promises.writeFile(filePath, replacedContent, "utf8");
        logger.log(chalk.gray(`Done for ${filePath}`));
      } else {
        logger.log(chalk.gray(`Checked ${filePath}`));
      }
    }

    // Function to recursively search and replace in all files
    async function replaceInDirectory(dir: string) {
      const ignore = [
        `${dir}/**/node_modules/**`,
        `${dir}/**/dist/**`,
        `${dir}/**/build/**`,
        `${dir}/**/.next/**`,
        `${dir}/README.md`,
        `${dir}/package-lock.json`,
        `${dir}/**/replace-tokens.ts`,
      ];
      const tsFiles = await glob(`${dir}/**/*.{ts,tsx}`, {
        ignore,
      });
      const pjsonFiles = await glob(`${dir}/**/package.json`, {
        ignore,
      });
      const workflows = await glob(`${dir}/**/.github/workflows/*`, {
        ignore,
      });
      const docker = await glob(`${dir}/docker/*`, {
        ignore,
      });
      const infra = await glob(`${dir}/infra/*`, {
        ignore,
      });
      const allFiles = Array.from(
        new Set(
          tsFiles
            .concat(pjsonFiles)
            .concat(workflows)
            .concat(docker)
            .concat(infra)
        )
      );
      await Promise.all(allFiles.map((file) => replaceTextInFile(file)));
    }

    const rootDir = path.join(__dirname, "..", "..");
    await replaceInDirectory(rootDir);
  }

  const rootDir = path.join(__dirname, "..", "..");
  //? Reinstall dependencies
  logger.log(chalk.blue("Reinstalling dependencies..."));
  execSync("rm -rf node_modules", {
    cwd: rootDir,
  });
  execSync("npm install", {
    cwd: rootDir,
    stdio: "inherit",
  });
  logger.log(chalk.gray("Done!"));
};
