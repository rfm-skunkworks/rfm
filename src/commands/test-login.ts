import { Command, createCommand } from "commander";
import { loginOrRegisterUserWithEmail } from "../clients/loginOrRegisterUser";
export const createLoginCommand = (): Command => {
  const cmd = createCommand();

  cmd
    .name("login")
    .description("login a user")
    .action(async () => {
      await loginOrRegisterUserWithEmail();
    });

  return cmd;
};
