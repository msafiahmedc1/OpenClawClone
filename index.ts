#!/usr/bin/env bun

import { Command } from "commander";
import { runWakeup } from "./tui/wakeup";

const program = new Command();

program
  .name("ai-coding-assistant-cli")
  .description("AI Coding Assistant CLI with text and voice controls")
  .version("1.0.0");

program
  .command("wakeup")
  .description("Start AI Coding Assistant CLI")
  .action(async () => {
    await runWakeup();
  });

await program.parseAsync(process.argv);
