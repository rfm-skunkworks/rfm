import { Command, createCommand } from "commander";
import chalk from "chalk";

import { logDebugInfo, withErrors } from "./common";
import { RegistryClient } from "../clients/realm";

function parseCommaSeparatedList(value: string, dummyPrevious: any) {
  let tags = value.split(",");
  tags.forEach((element, index, array) => {
    array[index] = element.trim();
  });
  return tags;
}

function parseName(value: string, dummyPrevious: any) {
  return value.trim();
}

export const createSearchCommand = (): Command => {
  const cmd = createCommand();

  cmd
    .name("search")
    .alias("s")
    .description(
      "Search for realm functions by name and/or comma seperated list of tags"
    )
    .option("-d, --debug", "log debug information")
    .option("-n, --name [string]", "name", parseName)
    .option("-t, --tags <tags...>", "tags", parseCommaSeparatedList)
    .action(
      withErrors(async (options) => {
        if (options.debug) {
          logDebugInfo(options, {});
        }

        if (!options.name && !options.tags) {
          throw Error("provide either name (-n) or tags (-t)");
        }

        console.log(chalk.yellow(`Searching...`));

        let res = await RegistryClient.searchFunctions(
          options.name || "",
          options.tags || []
        );
        if (res.length === 0) {
          console.log(chalk.redBright("No functions found"));
        } else {
          console.log(chalk.greenBright("Found the following functions: \n"));
          res.forEach((func, idx) => {
            process.stdout.write(chalk.gray(`${idx}. `));
            console.log(chalk.cyanBright(` ${func.name}:`));
            console.log(chalk.whiteBright(`\t${func.description}`));
            console.log();
          });
          console.log(
            chalk.greenBright("Install a function using rfm i <function name>")
          );
        }
      })
    );

  return cmd;
};
