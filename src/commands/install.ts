import { Command, createCommand } from "commander";
import RealmClient from "../clients/realm";

import { ExitStatus, logDebugInfo, logExitStatus } from "./common";
import { RealmApp } from "../index";

export const createInstallCommand = (): Command => {
  const cmd = createCommand();

  cmd
    .name("install")
    .alias("add")
    .description("Install realm function from registry")
    .argument("<function-name>", "realm function to install")
    .option("-d, --debug", "log debug information")
    .action(async (funcName, options) => {
      console.log(`installing function: '${funcName}'`);
      try {
        if (options.debug) {
          logDebugInfo(options, { funcName });
        }

        const res = await RealmClient.getFunctionSource(RealmApp);
        console.log("res:", JSON.stringify(res?.data));

        logExitStatus(ExitStatus.Success);
        return;
      } catch (error) {
        const err = error as Error;
        console.error(error);
        logExitStatus(ExitStatus.Failure, err.message);
        return;
      }
      console.log("objechellot");
    });

  return cmd;
};
