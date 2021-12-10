import chalk from "chalk";
import { OptionValues } from "commander";

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
    case ExitStatus.Failure:
      console.log(
        chalk.redBright.bold(
          error ? `Command failed: ${error}` : "Command failed."
        )
      );
      break;
  }
};

// stolen from here: https://github.com/tj/commander.js/issues/505#issuecomment-244988124
export const withErrors = (command: (...args: any[]) => Promise<void>) => {
  return async (...args: any[]) => {
    try {
      await command(...args);
    } catch (e) {
      const err = e as Error;
      logExitStatus(ExitStatus.Failure, err.message);
      process.exitCode = 1;
    }
  };
};
