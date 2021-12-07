import { Command } from "commander";
import dotenv from "dotenv";

// parse .env file and store the values in process.env
dotenv.config();

const REALM_CLIENT_APP_ID = process.env.REALM_CLIENT_APP_ID || "";
const appConfig = {
  id: REALM_CLIENT_APP_ID,
  timeout: 10000,
};

export const RealmApp = new Realm.App(appConfig);

import { createInstallCommand } from "./commands/install";
import { createSearchCommand } from "./commands/search";

const program = new Command();
program.version("0.1.0");

program.addCommand(createInstallCommand());
program.addCommand(createSearchCommand());

program.parse(process.argv);
