import { Command, createCommand } from "commander";
import path from "path";
import fs from "fs";
import { fileNames, getRealmRootDir } from "../realm/appStructure";
import { RegistryClient } from "../clients/realm";

import { ExitStatus, logDebugInfo, logExitStatus, withErrors } from "./common";
import chalk from "chalk";
import axios from "axios";
import { RFMFunctions } from "../models/functionRegistry";

async function installFunctionFromRegistry(
  funcName: string,
  saveToConfig: boolean
) {
  const appRootDir = await getRealmRootDir(5);
  if (!appRootDir) {
    throw Error("not in realm app");
  }

  const functionsDir = path.join(appRootDir, fileNames.dirFunctions);

  const registryFunc = await RegistryClient.getFunction(funcName);
  if (!registryFunc) {
    throw Error(`function "${funcName}" not found in registry`);
  }
  // TODO base64 decode the source
  const { raw: functionSource, name: functionName } = registryFunc;

  const newFunctionFile = path.join(functionsDir, `${functionName}.js`);
  try {
    fs.writeFileSync(newFunctionFile, functionSource, {});
    if (saveToConfig) {
      const rfmConfigPath = path.join(appRootDir, fileNames.rfmJSON);
      let functions: RFMFunctions = {};
      if (fs.existsSync(rfmConfigPath)) {
        let config = JSON.parse(fs.readFileSync(rfmConfigPath).toString());
        if (config.functions) {
          functions = config.functions;
        }
      }
      functions[functionName] = { secrets: registryFunc.secrets || [] };
      fs.writeFileSync(
        rfmConfigPath,
        JSON.stringify({ functions: functions }, null, 2)
      );
      console.log(
        chalk.greenBright(`Saved function metadata to ${fileNames.rfmJSON}`)
      );
    }
    return newFunctionFile;
  } catch (err) {
    throw Error(`failed to write function to file: ${err}`);
  }
}

async function installFunctionsFromConfig() {
  console.log(chalk.yellow(`Installing functions from RFM config`));
  const appRootDir = await getRealmRootDir(5);
  if (!appRootDir) {
    throw Error("not in realm app");
  }

  const rfmConfigPath = path.join(appRootDir, fileNames.rfmJSON);
  if (!fs.existsSync(rfmConfigPath)) {
    throw Error(`expected to find config file at: ${rfmConfigPath}`);
  }
  let config;
  try {
    config = JSON.parse(fs.readFileSync(rfmConfigPath).toString());
  } catch (err) {
    throw err;
  }
  const functions: RFMFunctions = config.functions;
  if (!functions) {
    throw Error(
      `invalid ${fileNames.rfmJSON} file: expected to find a 'functions' key`
    );
  } else if (typeof functions !== "object") {
    throw Error(
      `invalid ${fileNames.rfmJSON} file: 'functions' must be an object`
    );
  }
  // const valuesURL = process.env.REALM_VALUES_URL;
  // if (!valuesURL) {
  //   throw Error("could not find REALM_VALUES_URL in environment");
  // }
  // const res = await axios.get(valuesURL, {
  //   headers: {
  //     apiKey: RegistryClient.getAPIKey(),
  //   },
  // });
  // console.log(res.data);

  for (const [name, value] of Object.entries(functions)) {
    if (value.secrets && !Array.isArray(value.secrets)) {
      throw Error(`${name}.secrets must be an array`);
    }

    const newFunctionFile = await installFunctionFromRegistry(name, false);
    console.log(chalk.greenBright(`installed ${name} to ${newFunctionFile}`));
  }
}

export const createInstallCommand = (): Command => {
  const cmd = createCommand();

  cmd
    .name("install")
    .alias("add")
    .alias("i")
    .description("Install realm function")
    .argument("[function-name]", "realm function to install")
    .option("-d, --debug", "log debug information")
    .option("-s, --save", "save installed function to the RFM config file")
    .action(
      withErrors(async (funcName, options) => {
        if (options.debug) {
          logDebugInfo(options, { funcName });
        }
        if (funcName) {
          console.log(
            chalk.yellow(`Requested installation of function: '${funcName}'`)
          );
          let newFunctionFile = await installFunctionFromRegistry(
            funcName,
            options.save
          );
          console.log(
            chalk.greenBright(`Wrote function to ${newFunctionFile}`)
          );
          logExitStatus(ExitStatus.Success);
        } else {
          await installFunctionsFromConfig();
        }
      })
    );

  return cmd;
};
