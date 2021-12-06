import { Command, createCommand } from "commander";

export const createInstallCommand = (): Command => {
  const cmd = createCommand();

  cmd
    .name("install")
    .alias("add")
    .description("Install realm function from registry")
    .argument("<function-name>", "realm function to install")
    .action((funcName) => {
      console.log(`installing function: '${funcName}'`);
    });

  return cmd;
};
