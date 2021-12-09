import { Command, createCommand } from "commander";
import prompt, { RevalidatorSchema } from "prompt";
import chalk from "chalk";

import path from "path";
import { readFileSync } from "fs";

import { RealmAppSingleton, RegistryClient } from "../clients/realm";
import {
  AddRegistryFunctionRequestVariables,
  ValueDescription,
} from "models/functionRegistry";
import { logDebugInfo, withErrors } from "./common";

export const createPushCommand = (): Command => {
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

        // get authenticated user
        const currentUser = RealmAppSingleton.get().currentUser;
        const ownerEmail = currentUser?.profile.email;
        const ownerId = currentUser?.id;
        if (!currentUser || !ownerId || !ownerEmail) {
          throw Error("User not found! Please login to push your function");
        }

        if (!options.tags || options.tags?.length === 0) {
          throw Error(
            "No tags found. Please supply tags to the function. Tags help users to find functions under a certain topic"
          );
        }

        // read specified function file
        const { source, name } = getFunctionFileContents(path);

        prompt.start();

        const descriptionInput = await prompt.get(functionDescriptionPrompt);

        const shouldPromptValuesOrDeps = await prompt.get(
          hasValueOrBooleanPromptSchema
        );

        let values: ValueDescription[] = [];
        if (shouldPromptValuesOrDeps.hasValues) {
          values = await promptValues();
        }

        let dependencies: string[] = [];
        if (shouldPromptValuesOrDeps.hasDependencies) {
          console.log("TEST: should get dependencies");
        }

        const req: AddRegistryFunctionRequestVariables = {
          name,
          description: <string>descriptionInput.description,
          tags: options.tags,
          source,
          downloads: [],
          values,
          dependencies,
          ownerId,
          ownerEmail,
        };
        const res = await RegistryClient.pushFunction(req);
        if (res) {
          console.log(chalk.green(`Pushed function at "${path}" to registry`));
        }
        return;
      })
    );

  return cmd;
};

interface FunctionFileContent {
  error?: string;
  name: string;
  path: string;
  source: string;
}
const getFunctionFileContents = (filepath: string): FunctionFileContent => {
  const fileNameTokens = path.basename(filepath).split(".");

  if (fileNameTokens.length < 2) {
    return {
      error: "invalid path",
      name: "",
      path: "",
      source: "",
    };
  }

  let out: FunctionFileContent = {
    name: fileNameTokens[0],
    path: filepath,
    source: "",
  };

  const buf = readFileSync(filepath, {});
  out.source = buf.toString();
  return out;
};

const functionDescriptionPrompt: {
  properties: Record<string, RevalidatorSchema>;
} = {
  properties: {
    description: {
      description: "enter a description of what this function does",
      pattern: /^[\w\s]+$/,
      message: "must enter a description to tell users what this function does",
      required: true,
    },
  },
};

const hasValueOrBooleanPromptSchema: {
  properties: Record<string, RevalidatorSchema>;
} = {
  properties: {
    hasValues: {
      description: "Does this function rely on any realm values? (t/f)",
      type: "boolean",
      message: "asdf",
      required: true,
    },
    hasDependencies: {
      description: "Does the function rely on any npm dependencies? (t/f)",
      type: "boolean",
      message: "asdf",
      required: true,
    },
  },
};

const valuePromptSchema = {
  properties: {
    name: {
      description:
        "enter value's name (press enter if no more values are needed)",
      pattern: /(^([a-zA-Z\s\-]|[0-9])+$)|\n/,
      message: "name must contain only alphanumeric characters or '-'",
      required: true,
    },
    description: {
      description:
        "enter a description of what this value does in the function",
      pattern: /^[\w\s]+$/,
      message:
        "must enter a description to tell users this value does in the function",
      required: true,
    },
  },
};

const promptValues = async (): Promise<ValueDescription[]> => {
  let out: ValueDescription[] = [];

  while (true) {
    const { name, description } = await prompt.get(valuePromptSchema);
    if (name === "") {
      break;
    }
    out.push({ name: <string>description, description: <string>description });
  }

  return out;
};

// const promptDependencies = () => {};
