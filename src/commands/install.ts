import { Command, createCommand } from "commander";
import path from "path";
import fs from "fs";
import { fileNames, getRealmRootDir } from "../realm/appStructure";
import { RegistryClient } from "@clients/realm";

import { ExitStatus, logDebugInfo, logExitStatus, withErrors } from "./common";
import chalk from "chalk";

export const createInstallCommand = (): Command => {
  const cmd = createCommand();

  cmd
    .name("install")
    .alias("add")
    .alias("i")
    .description("Install realm function from registry")
    .argument("<function-name>", "realm function to install")
    .option("-d, --debug", "log debug information")
    .action(
      withErrors(async (funcName, options) => {
        console.log(
          chalk.yellow(`Requested installation of function: '${funcName}'`)
        );
        if (options.debug) {
          logDebugInfo(options, { funcName });
        }

        const appRootDir = await getRealmRootDir(5);
        if (!appRootDir) {
          throw Error("not in realm app");
        }

        const functionsDir = path.join(appRootDir, fileNames.dirFunctions);

        const registryFunc = await RegistryClient.getFunction(funcName);
        if (!registryFunc) {
          throw Error("function not found in registry");
        }
        // TODO base64 decode the source
        const { raw: functionSource, name: functionName } = registryFunc;

        const newFunctionFile = path.join(functionsDir, `${functionName}.js`);
        fs.writeFile(newFunctionFile, functionSource, {}, (err) => {
          if (err) {
            throw Error(`failed to write function to file: ${err}`);
          }

          console.log(
            chalk.greenBright(`Wrote function to ${newFunctionFile}`)
          );
          logExitStatus(ExitStatus.Success);
        });
        return;
      })
    );

  return cmd;
};
