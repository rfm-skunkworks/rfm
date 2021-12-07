import { Command } from "commander";
import dotenv from "dotenv";
import Realm from "realm";

import { createInstallCommand } from "./commands/install";
import { createSearchCommand } from "./commands/search";
import { createLoginCommand } from "./commands/test-login";

// parse .env file and store the values in process.env
dotenv.config();

const program = new Command();
program.version("0.1.0");

program.addCommand(createInstallCommand());
program.addCommand(createSearchCommand());
program.addCommand(createLoginCommand());

program.parse(process.argv);
