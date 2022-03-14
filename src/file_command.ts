// deno-lint-ignore-file no-explicit-any

import {
  appendFileSync,
  existsSync,
} from "https://deno.land/std@0.129.0/node/fs.ts";

import { eol, toCommandValue } from "./utils.ts";

export function issueCommand(command: string, message: any): void {
  const filePath = Deno.env.get(`GITHUB_${command}`);

  if (!filePath) {
    throw new Error(
      `Unable to find environment variable for file command ${command}`,
    );
  }

  if (!existsSync(filePath)) {
    throw new Error(`Missing file at path: ${filePath}`);
  }

  appendFileSync(filePath, `${toCommandValue(message)}${eol}`, {
    encoding: "utf8",
  });
}
