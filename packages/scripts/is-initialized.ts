import chalk from "chalk";
import { config } from "dotenv";
import * as fs from "fs/promises";
import * as path from "path";
import * as url from "url";

import { logger } from "@next-boilerplate/lib";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
const rootPath = path.join(__dirname, "..");

config();

if (process.env.SKIP_INIT_CHECK === "true") process.exit(0);

const main = async () => {
  try {
    await fs.access(path.join(rootPath, "scripts", ".init-todo"));
    logger.log(chalk.red("Project not initialized!"));
    logger.log(chalk.yellow(`Run \`npm run init\` to initialize the project`));
    process.exit(1);
  } catch {
    // Do nothing
  }
};

main();
