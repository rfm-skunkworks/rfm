import { Command } from "commander";
import dotenv from "dotenv";

import { createPushCommand } from "./commands/push";
import { createInstallCommand } from "./commands/install";
import { createSearchCommand } from "./commands/search";
import { createLoginCommand } from "./commands/login";
import { createDeleteCommand } from "./commands/delete";

// parse .env file and store the values in process.env
dotenv.config();

const program = new Command();
program.version("0.1.0");

program.addCommand(createInstallCommand());
program.addCommand(createPushCommand());
program.addCommand(createSearchCommand());
program.addCommand(createLoginCommand());
program.addCommand(createDeleteCommand());

program.parse(process.argv);
