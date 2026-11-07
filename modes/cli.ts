import chalk from "chalk";
import { select, isCancel } from "../tui/interaction";
import { runAgentMode } from "./agent/orchestrator";
import { runAskMode } from "./ask/orchestrator";
import { runPlanMode } from "./plan/orchestrator";

export async function runCliMode() {
  while (true) {
    const mode = await select({
      message: "Which mode do you want select?",
      options: [
        { value: "agent", label: "Agent" },
        { value: "ask", label: "Ask" },
        { value: "plan", label: "Plan" },
        { value: "back", label: "Back to main menu" },
      ],
    });
    if (isCancel(mode)) return "cancel";
    if (mode === "back") return "back";
    if (mode === "agent") {
      await runAgentMode();
    } else if (mode === "ask") {
      await runAskMode();
    } else if (mode === "plan") {
      await runPlanMode();
    }
    if (mode !== "agent" && mode !== "ask" && mode !== "plan") {
      console.log(
        chalk.red("Mode not implemented yet. Please select another mode."),
      );
    }
  }
}
