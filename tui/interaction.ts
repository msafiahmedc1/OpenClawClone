import { AsyncLocalStorage } from "node:async_hooks";
import * as prompts from "@clack/prompts";
import type { Speech } from "../modes/voice/speech";

const voice = new AsyncLocalStorage<Speech>();
const CANCEL = Symbol("voice-cancel");
export const isCancel = (value: unknown): value is symbol =>
  value === CANCEL || prompts.isCancel(value);
export const withVoice = <T>(speech: Speech, run: () => Promise<T>) =>
  voice.run(speech, run);
const normalize = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^\p{L}\p{N} ]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
const numbers = [
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
];
type Option<T> = { value: T; label?: string; hint?: string };

export async function say(message: string): Promise<void> {
  const speech = voice.getStore();
  if (speech)
    await speech.speak(
      message.replace(/\x1b\[[0-9;]*m/g, "").replace(/[`#*]/g, ""),
    );
}

async function hear(
  message: string,
  choices?: string[],
): Promise<string | symbol> {
  const speech = voice.getStore()!;
  console.log(message);
  await say(message + ". Say cancel to go back.");
  for (let attempt = 0; attempt < 3; attempt++) {
    const heard = (
      await speech.listen(
        choices ? [...new Set([...choices, "cancel"])] : undefined,
      )
    ).trim();
    if (normalize(heard) === "cancel") return CANCEL;
    if (heard) {
      console.log(`Heard: ${heard}`);
      return heard;
    }
    await say("I did not catch that. Please try again.");
  }
  return CANCEL;
}

export async function select<T>(options: {
  message: string;
  options: Option<T>[];
}): Promise<T | symbol> {
  if (!voice.getStore())
    return prompts.select(options as Parameters<typeof prompts.select<T>>[0]);
  const aliases = options.options.map((o, i) => [
    normalize(o.label ?? String(o.value)),
    String(i + 1),
    numbers[i] ?? String(i + 1),
  ]);
  const message =
    options.message +
    ". " +
    options.options.map((o, i) => `${i + 1}: ${o.label ?? o.value}`).join(". ");
  while (true) {
    const value = await hear(message, aliases.flat());
    if (isCancel(value)) return CANCEL;
    const index = aliases.findIndex((a) => a.includes(normalize(value)));
    if (index >= 0) return options.options[index]!.value;
    await say("Please say an option name or number.");
  }
}

export async function confirm(options: {
  message: string;
  initialValue?: boolean;
}): Promise<boolean | symbol> {
  if (!voice.getStore()) return prompts.confirm(options);
  const value = await select({
    message: options.message,
    options: [
      { value: true, label: "Yes" },
      { value: false, label: "No" },
    ],
  });
  return value;
}

export async function text(options: {
  message: string;
  placeholder?: string;
  initialValue?: string;
  validate?: (value: string | undefined) => string | undefined;
}): Promise<string | symbol> {
  if (!voice.getStore()) return prompts.text(options);
  while (true) {
    const value = await hear(options.message);
    if (isCancel(value)) return CANCEL;
    const error = options.validate?.(value);
    if (error) {
      await say(error);
      continue;
    }
    // Read back dictated goals and filenames before sending them to the agent.
    const accepted = await confirm({ message: `Use: ${value}?` });
    if (isCancel(accepted)) return CANCEL;
    if (accepted) return value;
  }
}

export async function multiselect<T>(options: {
  message: string;
  options: Option<T>[];
  initialValues?: T[];
  required?: boolean;
}): Promise<T[] | symbol> {
  if (!voice.getStore())
    return prompts.multiselect(
      options as Parameters<typeof prompts.multiselect<T>>[0],
    );
  const picked: T[] = [];
  const all = await confirm({ message: "Execute all plan steps?" });
  if (isCancel(all)) return CANCEL;
  if (all) return options.options.map((o) => o.value);
  for (const option of options.options) {
    const include = await confirm({
      message: `Include step: ${option.label}?`,
    });
    if (isCancel(include)) return CANCEL;
    if (include) picked.push(option.value);
  }
  return picked;
}
