import { Command, createCommand } from "commander";
import chalk from "chalk";

import path from "path";
import fs from "fs";

import { fileNames, getRealmRootDir } from "../realm/appStructure";
import { RegistryClient } from "../clients/realm";
import { RFMFunctions } from "../models/functionRegistry";
import { logDebugInfo, withErrors } from "./common";

import prompt, { RevalidatorSchema } from "prompt";
import colors from "colors/safe";
prompt.message = "";

const realmValuesPath = "/values";

async function installFunctionFromRegistry(
  funcName: string,
  saveToConfig: boolean
) {
  const appRootDir = await getRealmRootDir(5);
  if (!appRootDir) {
    throw Error("not in realm app");
  }

  const functionsDir = path.join(appRootDir, fileNames.dirFunctions);

  const registryFunc = await RegistryClient.downloadFunction(funcName);
  if (!registryFunc) {
    throw Error(`function "${funcName}" not found in registry`);
  }
  // TODO base64 decode the source
  const { raw: functionSource, name: functionName } = registryFunc;

  const newFunctionFile = path.join(functionsDir, `${functionName}.js`);
  try {
    fs.writeFileSync(newFunctionFile, functionSource, {});

    if (registryFunc.values.length > 0) {
      const valuesPath = path.join(appRootDir, realmValuesPath);
      let wroteValue = false;
      prompt.start();
      for (const value of registryFunc.values) {
        const valueJSONPath = path.join(valuesPath, `${value.name}.json`);
        if (!fs.existsSync(valueJSONPath)) {
          console.log(chalk.yellowBright(`Writing "${value.name}"`));
          const val = await prompt.get(valueSchema);
          fs.writeFileSync(
            valueJSONPath,
            JSON.stringify({
              name: value.name,
              value: val.value,
            })
          );
          wroteValue = true;
          console.log(
            chalk.yellowBright(
              `Saving value "${value.name}" to ${valueJSONPath}`
            )
          );
          console.log(
            chalk.yellowBright(`    Description: ${value.description}\n`)
          );
        }
      }
      if (wroteValue) {
        console.log(
          chalk.yellowBright(
            "\nPlease update the contents of the <value>.JSON files\n"
          )
        );
      }
    }

    if (saveToConfig) {
      const rfmConfigPath = path.join(appRootDir, fileNames.rfmJSON);
      let functions: RFMFunctions = {};
      if (fs.existsSync(rfmConfigPath)) {
        let config = JSON.parse(fs.readFileSync(rfmConfigPath).toString());
        if (config.functions) {
          functions = config.functions;
        }
      }
      functions[functionName] = { values: registryFunc.values || [] };
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
    throw Error(`failed to write ${functionName} to file: ${err}`);
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

  for (const [name, value] of Object.entries(functions)) {
    if (value.values && !Array.isArray(value.values)) {
      throw Error(`${name}.values must be an array`);
    }

    const newFunctionFile = await installFunctionFromRegistry(name, false);
    console.log(chalk.greenBright(`Installed ${name} to ${newFunctionFile}`));
  }
}

export const createInstallCommand = (): Command => {
  const cmd = createCommand();

  cmd
    .name("install")
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
            chalk.yellow(`Requested installation of function: "${funcName}"\n`)
          );
          let newFunctionFile = await installFunctionFromRegistry(
            funcName,
            options.save
          );
          console.log(
            chalk.greenBright(`Saved "${funcName}" to ${newFunctionFile}`)
          );
        } else {
          await installFunctionsFromConfig();
        }
      })
    );

  return cmd;
};

const valueSchema: {
  properties: Record<string, RevalidatorSchema>;
} = {
  properties: {
    value: {
      description: colors.cyan("Enter a value"),
      message: "must enter a value",
      required: true,
      type: "string",
    },
  },
};
