/**
 * This script remove all the packages you don't want from the monorepo
 */

import chalk from "chalk";
import * as fs from "fs";
import inquirer from "inquirer";
import * as path from "path";
import * as url from "url";
import YAML from "yaml";

import { logger } from "@next-boilerplate/lib/logger";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
const rootDir = path.join(__dirname, "..", "..");

const dockerComposePaths = [
  path.join(rootDir, "docker", "docker-compose.yml"),
  path.join(rootDir, "docker", "docker-compose.local.yml"),
  path.join(rootDir, ".devcontainer", "docker-compose.yml"),
];

export const modulesSelection = async () => {
  const { onlyFront } = await inquirer.prompt<{ onlyFront: boolean }>([
    {
      type: "confirm",
      name: "onlyFront",
      message: "Do you want to transform the app into a front-end only app?",
      default: false,
    },
  ]);

  if (onlyFront) {
    // Remove the docker-compose services that are not needed anymore
    for (const dockerComposePath of dockerComposePaths) {
      const dockerCompose = fs.readFileSync(dockerComposePath).toString();
      const dockerComposeYaml = YAML.parse(dockerCompose);
      delete dockerComposeYaml.services.db;
      delete dockerComposeYaml.services.redis;
      delete dockerComposeYaml.volumes;
      fs.writeFileSync(dockerComposePath, YAML.stringify(dockerComposeYaml));
    }
    logger.log(chalk.gray("Removed docker-compose services!"));
  }
};
