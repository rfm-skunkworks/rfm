import { Command, createCommand } from "commander";
import prompt from "prompt";
import colors from "colors/safe";
prompt.message = "";

import { loginWithEmail, registerWithEmail } from "../clients/realm";

const registerOrLoginSchema = {
  properties: {
    registerOrLogin: {
      description: colors.cyan("Choose to either 'register' or 'login'"),
      pattern: /\b(register)\b|\b(login)\b/,
      message: "valid options are 'register' and 'login'",
      required: true,
    },
  },
};

const emailAndPasswordSchema = {
  properties: {
    email: {
      description: colors.cyan("Enter username"),
      pattern:
        /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/,
      message: "must be a valid email",
      required: true,
    },
    password: {
      description: colors.cyan("Enter password"),
      replace: "*",
      pattern: /^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z]).{8,}$/,
      message:
        "must be >= 8 characters, contain a capital letter, lowercase letter, and number",
      required: true,
      hidden: true,
    },
  },
};

export const createLoginCommand = (): Command => {
  const cmd = createCommand();

  cmd
    .name("login")
    .description("login a user")
    .action(async () => {
      prompt.start();

      try {
        const res = await prompt.get(registerOrLoginSchema);
        if (res.registerOrLogin === "register") {
          let registered = false;
          do {
            const emailAndPassword = await prompt.get(emailAndPasswordSchema);
            registered = await registerWithEmail(
              <string>emailAndPassword.email,
              <string>emailAndPassword.password
            );
          } while (!registered);
        } else {
          let loggedIn = false;
          do {
            const emailAndPassword = await prompt.get(emailAndPasswordSchema);
            loggedIn = await loginWithEmail(
              <string>emailAndPassword.email,
              <string>emailAndPassword.password
            );
          } while (!loggedIn);
        }
        process.exit(0);
      } catch (err) {
        console.log(err);
      }
    });

  return cmd;
};
