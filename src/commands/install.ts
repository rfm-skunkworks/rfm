import { Command, createCommand } from "commander";

import { ExitStatus, logDebugInfo, logExitStatus } from "./common";

export const createInstallCommand = (): Command => {
  const cmd = createCommand();

  cmd
    .name("install")
    .alias("add")
    .description("Install realm function from registry")
    .argument("<function-name>", "realm function to install")
    .option("-d, --debug", "log debug information")
    .action((funcName, options) => {
      console.log(`installing function: '${funcName}'`);
      if (options.debug) {
        logDebugInfo(options, { funcName });
      }
      logExitStatus(ExitStatus.Failure);
    });

  return cmd;
};
