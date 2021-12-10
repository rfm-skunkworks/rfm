import { Command, createCommand } from "commander";
import chalk from "chalk";

import { RealmAppSingleton, RegistryClient } from "../clients/realm";
import { logDebugInfo, withErrors } from "./common";

export const createDeleteCommand = (): Command => {
  const cmd = createCommand();

  cmd
    .name("delete")
    .alias("d")
    .description("Delete function from the registry")
    .argument(
      "[functionName]",
      "name of function you want to delete from registry"
    )
    .option("-d, --debug", "log debug information")
    .action(
      withErrors(async (functionName, options) => {
        if (options.debug) {
          logDebugInfo(options, { functionName });
        }

        // get authenticated user
        const currentUser = RealmAppSingleton.get().currentUser;
        const ownerId = currentUser?.id;
        if (!currentUser || !ownerId) {
          throw Error("User not found! Please login to push your function");
        }

        const ownedFunctions = await RegistryClient.getOwnedFunctions(ownerId);
        if (ownedFunctions.length === 0) {
          throw Error(
            "Error fetching functions or there are no functions to delete"
          );
        }

        if (functionName === "") {
          throw Error("Must supply a name of the function you wish to delete");
        }

        let functionFound = false;
        for (let i = 0; i < ownedFunctions.length; i++) {
          if (ownedFunctions[i].name === functionName) {
            functionFound = true;
            const deletePayload = await RegistryClient.deleteFunction(
              ownerId,
              functionName
            );
            if (deletePayload._id) {
              console.log(chalk.green(`Deleted function '${functionName}'`));
              return;
            } else {
              throw Error(`Failed to delete function '${functionName}'`);
            }
          }
        }
        if (!functionFound) {
          throw Error(`You do not own a function named '${functionName}'`);
        }
      })
    );

  return cmd;
};
