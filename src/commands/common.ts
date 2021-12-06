import chalk from "chalk";
import { Argument, OptionValues } from "commander";

export enum ExitStatus {
  Success = 0,
  Failure,
}

export const logDebugInfo = (
  options: OptionValues,
  args: Record<string, any>
) => {
  console.log("--- Debug start ---");
  console.log("arguments:", args);
  console.log("options:", options);
  console.log("--- Debug end ---");
  console.log("");
};

export const logExitStatus = (status: ExitStatus, error?: string) => {
  switch (status) {
    case ExitStatus.Success:
      console.log(chalk.greenBright.bold("Command executed successfully."));
      break;
    case ExitStatus.Failure:
      console.log(
        chalk.redBright.bold(
          error ? `Command failed: ${error}` : "Command failed."
        )
      );
      break;
  }
};
