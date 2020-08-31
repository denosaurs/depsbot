import * as core from "@actions/core";

async function run(): Promise<void> {
  try {
    const ms: string = core.getInput("milliseconds");
    core.debug(`Waiting ${ms} milliseconds ...`); // debug is only output if you set the secret `ACTIONS_RUNNER_DEBUG` to true

    core.debug(new Date().toTimeString());
    core.debug(new Date().toTimeString());

    core.setOutput("time", new Date().toTimeString());
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
