import { Command } from "commander";
import dotenv from "dotenv";

import { createInstallCommand } from "./commands/install";

// parse .env file and store the values in process.env
dotenv.config();

const program = new Command();
program.version("0.1.0");

program.addCommand(createInstallCommand());

program.parse(process.argv);
