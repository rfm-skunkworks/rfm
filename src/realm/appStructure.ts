import { constants as fsConstants } from "fs";
import { access } from "fs/promises";
import path from "path";

export const fileNames = {
  fileRealmConfigJSON: "realm_config.json",
  fileConfigJSON: "config.json",
  rfmJSON: "rfm.json",

  dirFunctions: "functions",
};

// checks if we're in the root dir of a realm app
export const isInRealmAppRootDir = async (dir: string) => {
  let accessable = false;
  try {
    await access(
      path.join(dir, fileNames.fileRealmConfigJSON),
      fsConstants.R_OK
    );
    accessable = true;
  } catch {}
  return accessable;
};

// checks if we're in the functions dir of a realm app
export const isInRealmAppFunctionsFolder = async (dir: string) => {
  let configFileAccessable = false;
  let realmConfigFileAccessable = false;
  try {
    await access(path.join(dir, fileNames.fileConfigJSON), fsConstants.R_OK);
    configFileAccessable = true;

    await access(
      path.join(dir, "..", fileNames.fileRealmConfigJSON),
      fsConstants.R_OK
    );
    realmConfigFileAccessable = true;
  } catch {}

  const pathParts = process.cwd().split("/");
  const currDir = pathParts[pathParts.length - 1];

  return (
    configFileAccessable &&
    realmConfigFileAccessable &&
    currDir === fileNames.dirFunctions
  );
};

// get realm root dir if cwd is inside of a realm app
export const getRealmRootDir = async (maxDepth = 5): Promise<string> => {
  let cwd = process.cwd();

  for (let i = 0; i < maxDepth; i++) {
    const isRootDir = await isInRealmAppRootDir(cwd);
    if (isRootDir) {
      return cwd;
    }
    cwd = path.dirname(cwd);
  }
  return "";
};
