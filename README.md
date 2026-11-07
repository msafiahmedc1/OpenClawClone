# OpenClawClone

Run `bun install`, then `bun run index.ts wakeup`. Set `OPENROUTER_API_KEY` and
`OPENROUTER_DEFAULT_MODEL` in `.env` for AI requests.

Choose **Voice** to use the same Agent, Ask, and Plan workflows through speech.
Voice uses Windows PowerShell and the built-in `System.Speech` engine; no speech
API key is needed. AI requests still use OpenRouter.

- Requires Windows, an installed speech recognition language, and a working default microphone and speaker. Allow desktop microphone access in Windows Settings.
- Optionally set `VOICE_LANGUAGE=en-US` in `.env` to choose an installed recognition language. Otherwise the first installed recognizer is used.
- Wait for **Listening...**, then speak an option name or number. Goals and filenames are read back for confirmation.
- Say **yes** or **no** for confirmations. Plan steps can be selected together or individually.
- Say **cancel** at any prompt to go back. Three missed recognition attempts cancel the prompt. Ctrl+C interrupts the active speech operation.
- File and shell changes still require approval. Say **Show diff** during individual review to hear the diff; it also appears in the terminal.
- Speech listens one turn at a time after playback finishes. It is not an always-on wake-word service. Dictation quality depends on the installed Windows language and microphone.

Checks: `bun test` and `bun node_modules/typescript/bin/tsc --noEmit`.
