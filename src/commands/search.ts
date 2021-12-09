import { Command, createCommand } from "commander";
import chalk from "chalk";

import { withErrors } from "./common";
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
    .option("-n, --name [string]", "name", parseName)
    .option("-t, --tags [tags]", "tags", parseCommaSeparatedList)
    .action(
      withErrors(async (options) => {
        if (Object.keys(options).length === 0) {
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
          let names: Array<string> = [];
          res.forEach((func) => {
            names.push(func.name);
          });
          console.log(
            chalk.greenBright(
              `Found the following functions: ${names.join(", ")}`
            )
          );
        }
      })
    );

  return cmd;
};
