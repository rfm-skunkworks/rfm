import { Command, createCommand } from "commander";
import path from "path";
import fs from "fs";
import { fileNames, getRealmRootDir } from "../realm/appStructure";
import { RegistryClient } from "../clients/realm";

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
        if (options.debug) {
          logDebugInfo(options, { funcName });
        }

        const appRootDir = await getRealmRootDir(5);
        if (!appRootDir) {
          throw "not in realm app";
        }

        const functionsDir = path.join(appRootDir, fileNames.dirFunctions);

        const registryFunc = await RegistryClient.getFunction(funcName);
        // TODO base64 decode the source
        const { raw: functionSource, name: functionName } = registryFunc;

        const newFunctionFile = path.join(functionsDir, `${functionName}.js`);
        fs.writeFile(newFunctionFile, functionSource, {}, (err) => {
          if (err) {
            throw `failed to write function to file: ${err}`;
          }

          console.log(`wrote function to ${newFunctionFile}`);
        });

        logExitStatus(ExitStatus.Success);
        return;
      } catch (error) {
        const err = error as Error;
        console.error(error);
        logExitStatus(ExitStatus.Failure, err.message);
        return;
      }
    });

  return cmd;
};
