import { Command, createCommand } from "commander";
import RealmClient from "../clients/realm";

import { ExitStatus, logDebugInfo, logExitStatus } from "./common";

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
        const res = await RealmClient.getFunctionSource();
        console.log(res?.data);
        if (options.debug) {
          logDebugInfo(options, { funcName });
        }
        logExitStatus(ExitStatus.Success);
      } catch (error) {
        const err = error as Error;
        logExitStatus(ExitStatus.Failure, err.message);
      }
    });

  return cmd;
};
