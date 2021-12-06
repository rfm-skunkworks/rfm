import { Command, createCommand } from "commander";
import {logIn, register} from "../realm/users"
import RealmClient from "../clients/realm";

import { ExitStatus, logDebugInfo, logExitStatus } from "./common";

export const createLoginCommand = (): Command => {
    const cmd = createCommand();

    cmd
        .name("login")
        .description("Login test")
        .action(async () => {
            // let registered = false;
            // do {
            //     registered = await register();
            // } while (!registered);

            let loggedIn = false;
            do {
                loggedIn = await logIn();
            } while (!loggedIn);
        });

    return cmd;
};
