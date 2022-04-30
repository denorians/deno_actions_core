import { path } from "../test_deps.ts";
import { fs } from "../test_deps.ts";

import { assertEquals } from "../test_deps.ts";

import { __dirname, assertToHaveBeenCalledTimes } from "../src/utils.ts";

export function assertWriteCalls(calls: string[]): void {
  assertToHaveBeenCalledTimes(Deno.stdout.write, calls.length);
}

export function createFileCommandFile(command: string): void {
  const filePath = path.join(__dirname, `test/${command}`);

  Deno.env.set(`GITHUB_${command}`, filePath);

  fs.appendFileSync(filePath, "", {
    encoding: "utf8",
  });
}

export function verifyFileCommand(
  command: string,
  expectedContents: string,
): void {
  const filePath = path.join(__dirname, `test/${command}`);
  const contents = fs.readFileSync(filePath, "utf8");

  try {
    assertEquals(contents, expectedContents);
  } finally {
    fs.unlinkSync(filePath);
  }
}

// TODO : implement oidc
// function getTokenEndPoint(): string {
//   return "https://vstoken.actions.githubusercontent.com/.well-known/openid-configuration";
// }
