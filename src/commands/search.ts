import { Command, createCommand } from "commander";

import { ExitStatus, logDebugInfo, logExitStatus } from "./common";

function parseCommaSeparatedList(value: string, dummyPrevious: any) {
    let tags = value.split(',')
    tags.forEach((element, index, array) => {
        array[index] = element.trim()
    })
    return tags;
}

function parseName(value: string, dummyPrevious: any) {
    return value.trim()
}


export const createSearchCommand = (): Command => {
    const cmd = createCommand();

    cmd
        .name("search")
        .alias("s")
        .description("Search for realm functions by name or tag")
        .option("-n, --name [string]", "name", parseName)
        .option("-t, --tags [tags]", "tags", parseCommaSeparatedList)
        .action((options) => {
            if (Object.keys(options).length === 0) {
                logExitStatus(ExitStatus.Failure, "provide either name (-n) or tags (-t)");
                return;
            }
        });

    return cmd;
};
