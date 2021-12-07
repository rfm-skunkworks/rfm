import { Command } from "commander";
import dotenv from "dotenv";

// parse .env file and store the values in process.env
dotenv.config();

import { createInstallCommand } from "./commands/install";
import { createSearchCommand } from "./commands/search";
import { createLoginCommand } from "./commands/test-login";

const program = new Command();
program.version("0.1.0");

program.addCommand(createInstallCommand());
program.addCommand(createSearchCommand());
program.addCommand(createLoginCommand());

program.parse(process.argv);
