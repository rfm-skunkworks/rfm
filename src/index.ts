import { Command } from "commander";
import { createInstallCommand } from "./commands/install";

const program = new Command();
program.version("0.1.0");

program.addCommand(createInstallCommand());

program.parse(process.argv);
