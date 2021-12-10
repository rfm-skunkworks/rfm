import { Command, createCommand } from "commander";
import prompt, { RevalidatorSchema } from "prompt";
import colors from "colors/safe";
prompt.message = "";

import chalk from "chalk";

import { basename } from "path";
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

        const curFunctionNames = await RegistryClient.findFunctionNames();
        const { source } = getFunctionFileContents(path);

        prompt.start();

        let nameInput = <string>(await prompt.get(functionNameSchema)).name;
        while (curFunctionNames.has(nameInput)) {
          console.log(
            chalk.redBright(
              `${nameInput} is already a function, please enter a different name`
            )
          );
          nameInput = <string>(await prompt.get(functionNameSchema)).name;
        }

        const descriptionInput = await prompt.get(functionDescriptionPrompt);
        const tagsInput = (<string>(
          (await prompt.get(functionTagsSchema)).tags
        )).split(" ");

        let tags = new Set();
        tagsInput.forEach((tag) => {
          let newTag = tag.trim();
          if (newTag.length > 0) tags.add(newTag);
        });

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
          name: nameInput,
          description: <string>descriptionInput.description,
          tags: <string[]>Array.from(tags),
          source,
          downloads: [],
          values,
          dependencies,
          ownerId,
          ownerEmail,
        };
        const res = await RegistryClient.pushFunction(req);
        if (res) {
          console.log(
            chalk.greenBright(`Pushed ${nameInput} at "${path}" to registry`)
          );
        }
        process.exit(0);
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
  const fileNameTokens = basename(filepath).split(".");

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

const functionNameSchema: {
  properties: Record<string, RevalidatorSchema>;
} = {
  properties: {
    name: {
      description: colors.cyan("Enter a name for this function"),
      pattern: /^[a-zA-Z-_]*$/,
      message: "name can only contain letters, underscores, and hyphens",
      required: true,
    },
  },
};

const functionDescriptionPrompt: {
  properties: Record<string, RevalidatorSchema>;
} = {
  properties: {
    description: {
      description: colors.cyan(
        "Enter a description of what this function does"
      ),
      pattern: /^[\w\s]+$/,
      message: "must enter a description to tell users what this function does",
      required: true,
    },
  },
};

const functionTagsSchema: {
  properties: Record<string, RevalidatorSchema>;
} = {
  properties: {
    tags: {
      description: colors.cyan(
        "Enter a space seperated list of tags for this function"
      ),
      required: false,
    },
  },
};

const hasValueOrBooleanPromptSchema: {
  properties: Record<string, RevalidatorSchema>;
} = {
  properties: {
    hasValues: {
      description: colors.cyan(
        "Does this function rely on any realm values? (t/[F])"
      ),
      type: "boolean",
    },
    hasDependencies: {
      description: colors.cyan(
        "Does the function rely on any npm dependencies? (t/[F])"
      ),
      type: "boolean",
    },
  },
};

const valueNamePromptSchema = {
  properties: {
    name: {
      description: colors.cyan("Enter value's name (enter 'n' if done)"),
      pattern: /^[a-zA-Z0-9]+[a-zA-Z0-9-_]*$/,
      message:
        "value name can only contain letters, numbers, underscores, and hyphens. must start with a letter or number",
      required: true,
    },
  },
};

const valueDescriptionPromptSchema = {
  properties: {
    description: {
      description: colors.cyan(
        "Enter a description of what this value does in the function"
      ),
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
    const { name } = await prompt.get(valueNamePromptSchema);
    if (name === "n") {
      break;
    }
    const { description } = await prompt.get(valueDescriptionPromptSchema);
    out.push({ name: <string>name, description: <string>description });
  }

  return out;
};

// const promptDependencies = () => {};
