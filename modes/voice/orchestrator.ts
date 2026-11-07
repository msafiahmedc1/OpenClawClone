import chalk from "chalk";
import { runCliMode } from "../cli";
import { withVoice } from "../../tui/interaction";
import { WindowsSpeech } from "./speech";

export async function runVoiceMode(): Promise<void> {
  const speech = new WindowsSpeech();
  try {
    await speech.check();
    console.log(
      chalk.bold(
        "Voice mode. Speak after Listening appears. Say cancel to go back.",
      ),
    );
    await withVoice(speech, runCliMode);
  } catch (error) {
    console.log(
      chalk.red(
        `Voice mode: ${error instanceof Error ? error.message : String(error)}`,
      ),
    );
  }
}
