import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";

export interface Speech {
  check(): Promise<void>;
  listen(choices?: string[]): Promise<string>;
  speak(text: string): Promise<void>;
}

export class WindowsSpeech implements Speech {
  private async run(
    operation: "check" | "listen" | "speak",
    payload: object,
  ): Promise<string> {
    if (process.platform !== "win32")
      throw new Error("Voice mode requires Windows.");
    return new Promise((resolve, reject) => {
      const script = readFileSync(
        fileURLToPath(new URL("./speech.ps1", import.meta.url)),
        "utf8",
      );
      const child = spawn(
        "powershell.exe",
        [
          "-NoLogo",
          "-NoProfile",
          "-NonInteractive",
          "-Command",
          `& {\n${script}\n} -Operation ${operation}`,
        ],
        { windowsHide: true, stdio: ["pipe", "pipe", "pipe"] },
      );
      let output = "",
        errors = "";
      const interrupt = () => {
        child.kill();
        reject(new Error("Voice input cancelled."));
      };
      process.once("SIGINT", interrupt);
      const timer = setTimeout(() => {
        child.kill();
        reject(
          new Error(
            "Windows speech timed out. Check your microphone and speech settings.",
          ),
        );
      }, 120_000);
      let ready = false;
      child.stdout.setEncoding("utf8").on("data", (data) => {
        output += data;
        if (
          !ready &&
          operation === "listen" &&
          output.includes("VOICE_READY")
        ) {
          ready = true;
          console.log("Listening...");
        }
      });
      child.stderr.setEncoding("utf8").on("data", (data) => {
        errors += data;
      });
      child.on("error", (error) => {
        clearTimeout(timer);
        process.removeListener("SIGINT", interrupt);
        reject(error);
      });
      child.stdin.on("error", () => {});
      child.on("close", (code) => {
        clearTimeout(timer);
        process.removeListener("SIGINT", interrupt);
        if (code === 0)
          resolve(output.replace(/^VOICE_READY\r?\n/m, "").trim());
        else reject(new Error(errors.trim() || "Windows speech failed."));
      });
      child.stdin.end(
        JSON.stringify({ language: process.env.VOICE_LANGUAGE, ...payload }),
      );
    });
  }
  async check() {
    const result = JSON.parse(await this.run("check", {})) as {
      language: string;
    };
    console.log(
      `Speech language: ${result.language}. Input: Windows default microphone.`,
    );
  }
  async listen(choices?: string[]) {
    const result = JSON.parse(await this.run("listen", { choices })) as {
      text: string;
      confidence: number;
      language: string;
    };
    if (!result.text) {
      console.log(
        "Windows returned no transcript. Check the default microphone and speak in the displayed speech language.",
      );
      return "";
    }
    console.log(
      `Windows heard: ${JSON.stringify(result.text)} (confidence ${result.confidence.toFixed(2)})`,
    );
    if (result.confidence < 0.35) {
      console.log(
        "Transcript rejected because recognition confidence was very low.",
      );
      return "";
    }
    return result.text;
  }
  async speak(text: string) {
    if (text.trim()) await this.run("speak", { text });
  }
}
