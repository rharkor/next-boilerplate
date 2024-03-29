import chalk from "chalk";
import { completeInitialisation } from "complete-initialisation";
import { config } from "dotenv";
import { envSetup } from "env-setup";
import * as fs from "fs/promises";
import { modulesSelection } from "modules-selection";
import { exit } from "node:process";
import { packagesSelection } from "packages-selection";
import * as path from "path";
import { replaceTokens } from "replace-tokens";
import * as url from "url";

import { logger } from "@next-boilerplate/lib/logger";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
const rootPath = path.join(__dirname, "..");

config();

async function main() {
  const alreadyInitialized = await fs
    .access(path.join(rootPath, "scripts", ".init-todo"))
    .then(() => false)
    .catch(() => true);

  if (!alreadyInitialized) {
    logger.log(chalk.green("Welcome to the init script!"));
  }

  if (!alreadyInitialized) {
    logger.log(chalk.blue('Starting the "modules selection" script...'));
    await modulesSelection();
    logger.log(chalk.green("Done!"));
  } else {
    logger.log(chalk.gray("Skipping modulesSelection()"));
  }

  if (!alreadyInitialized) {
    logger.log(chalk.blue('Starting the "replace tokens" script...'));
    await replaceTokens();
    logger.log(chalk.green("Done!"));
  } else {
    logger.log(chalk.yellow("Skipping replaceTokens()"));
  }

  if (!alreadyInitialized) {
    logger.log(chalk.blue('Starting the "packages selection" script...'));
    await packagesSelection();
    logger.log(chalk.green("Done!"));
  } else {
    logger.log(chalk.gray("Skipping packagesSelection()"));
  }

  logger.log(chalk.blue('Starting the "env setup" script...'));
  await envSetup();
  logger.log(chalk.green("Done!"));

  logger.log(chalk.blue('Starting the "complete initialisation" script...'));
  await completeInitialisation();

  exit(0);
}

main();
