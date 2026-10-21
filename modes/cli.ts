import chalk from "chalk";
import { select, isCancel } from "@clack/prompts";

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
      console.log(chalk.dim("You selected agent mode."));
    } else if (mode === "ask") {
      console.log(chalk.dim("You selected ask mode."));
    } else if (mode === "plan") {
      console.log(chalk.dim("You selected plan mode."));
    }
    if (mode !== "agent" && mode !== "ask" && mode !== "plan") {
      console.log(
        chalk.red("Mode not implemented yet. Please select another mode."),
      );
    }
  }
}
