import ora from "ora";
import spinners from "cli-spinners";
import inquirer from "inquirer";
import { $ } from "execa";

const globalObj = {
  spinner: null,
  cliModel: {
    inputModel: {
      type: "input",
      name: "inputValue",
      message: "default message",
      choices: [],
    } as Cli,
    listModel: {
      type: "list",
      name: "selectValue",
      message: "default message",
      choices: [],
    } as Cli,
  },
};

function runSpin(startText: string) {
  globalObj.spinner = ora({
    text: startText,
    spinner: spinners.earth,
  }).start();
}

function endSpin(endText: string) {
  globalObj.spinner.succeed(endText);
}

function stopSpin(error: any) {
  globalObj.spinner.fail("Sorry, i have error...");
  console.log(error);
}

interface Cli {
  type:
    | "checkbox"
    | "confirm"
    | "editor"
    | "expand"
    | "input"
    | "list"
    | "number"
    | "password"
    | "rawList";
  name: string;
  message: string;
  choices?: string[];
}

async function callCli(cli: Cli) {
  return await inquirer.prompt([
    {
      type: cli.type,
      name: cli.name,
      message: cli.message,
      choices: cli.choices ? cli.choices : null,
    },
  ]);
}

async function main() {
  try {
    const { command } = await callCli({
      ...globalObj.cliModel.listModel,
      name: "command",
      message: "Please choose the action you want : ",
      choices: ["Push"],
    });

    if (typeof command !== "string") return;

    if (command.toLowerCase() === "push") {
      runSpin("Stage All Changes...");
      await $`git add .`;
      endSpin("Compleate");

      const { commitMessage } = await callCli({
        ...globalObj.cliModel.inputModel,
        name: "commitMessage",
        message: "Please input your commit message : ",
      });

      runSpin("Write commit message...");
      await $`git commit -m ${commitMessage}`;
      endSpin("Compleate");

      runSpin("now push..");
      await $`git push origin ${await $`git branch --show-current`}`;
      endSpin("Compleate");
      //test commit
    }
  } catch (error) {
    stopSpin(error);
  }
}

main();
