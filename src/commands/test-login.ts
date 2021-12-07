import { Command, createCommand } from "commander";
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
      // let loggedIn = false;
      // do {
      //     loggedIn = await logIn();
      // } while (!loggedIn);
    });

  return cmd;
};
