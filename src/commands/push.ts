import { Command, createCommand } from "commander";
import { getRealmRootDir } from "../realm/appStructure";
import { RegistryClient } from "../clients/realm";

import { logDebugInfo, withErrors } from "./common";
import chalk from "chalk";
import { AddRegistryFunctionRequest } from "models/functionRegistry";

export const createInstallCommand = (): Command => {
  const cmd = createCommand();

  cmd
    .name("push")
    .alias("p")
    .description("Push your function to the rfm registry")
    .argument("[path]", "file path of the realm function to push")
    .option(
      "-t, --tags <tags...>",
      "specify tags that your function should be associated with"
    )
    .option("-d, --debug", "log debug information")
    .action(
      withErrors(async (path, options) => {
        console.log(
          chalk.yellow(`Requested push of function located at: '${path}'`)
        );
        if (options.debug) {
          logDebugInfo(options, { path });
        }

        const appRootDir = await getRealmRootDir(5);
        if (!appRootDir) {
          throw Error("not in realm app");
        }

        const req: AddRegistryFunctionRequest = {
          name: `test-${path}`,
          description: "test push function",
          tags: [],
          ownerId: "",
          dependencies: [],
          source: "",
          values: [],
        };
        const res = await RegistryClient.pushFunction(req);
        return;
      })
    );

  return cmd;
};
