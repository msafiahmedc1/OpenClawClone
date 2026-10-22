import chalk from "chalk";
import { isCancel, text } from "@clack/prompts";
import { defaultAgentConfig } from "./types";
import { ActionTracker } from "./action-tracker";
import { ToolExecutor } from "./tool-executor";

export async function runAgentMode() {
  console.log(chalk.bold("You selected agent mode."));
  const goal = await text({
    message: "What would you like the agent to do?",
    placeholder: "Please enter your goal here...",
  });
  if (isCancel(goal) || !goal.trim()) return;
  const config = defaultAgentConfig();
  const tracker = new ActionTracker();
  const executor = new ToolExecutor(tracker, config);
}
