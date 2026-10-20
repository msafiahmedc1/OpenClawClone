#!/usr/bin/env bun

import { Command } from "commander";
import { runWakeup } from "./tui/wakeup";

const program = new Command();

program.name("openclawclone").description("Open claw clone").version("1.0.0");

program
  .command("wakeup")
  .description("Wake up the open claw clone")
  .action(async () => {
    await runWakeup();
  });

await program.parseAsync(process.argv);
