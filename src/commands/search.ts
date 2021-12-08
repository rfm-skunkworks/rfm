import { Command, createCommand } from "commander";

import { ExitStatus, logDebugInfo, logExitStatus, withErrors } from "./common";
import axios, { AxiosResponse } from "axios";
import { RegistryClient } from "../clients/realm";
import chalk from "chalk";

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

function getFunctionSource(): Promise<AxiosResponse> {
  const realmGraphQLUrl = process.env.REALM_GQL_URL || "";
  const res = axios.post(realmGraphQLUrl, {
    query: `
    {
      function_registries(query: {name:"foo"}) {
        _id
        name
        owner_id
        raw
      }
    }
    `,
  });
  return res;
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
          console.log(chalk.greenBright("Found the following functions: \n"));
          res.forEach((func, idx) => {
            process.stdout.write(chalk.gray(`${idx}. `));
            console.log(chalk.cyanBright(` ${func.name}:`));
            console.log(chalk.cyanBright(`\t${func.description}`));
            console.log();
          });
        }
      })
    );

  return cmd;
};
