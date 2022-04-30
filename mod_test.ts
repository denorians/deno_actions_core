import { path } from "./test_deps.ts";
import { fs } from "./test_deps.ts";
import * as core from "./mod.ts";
import * as fixtures from "./test/fixtures.ts";

import {
  __dirname,
  eol,
  mockFunction,
  sep,
  textEncoder,
  toCommandProperties,
} from "./src/utils.ts";

// import { HttpClient } from "@actions/http-client"; // TODO : implement oidc

import { assertEquals, assertThrows } from "./test_deps.ts";

import { beforeAll, beforeEach, describe, it } from "./test_deps.ts";

const testEnvVars = {
  "my var": "",
  "special char var \r\n];": "",
  "my var2": "",
  "my secret": "",
  "special char secret \r\n];": "",
  "my secret2": "",
  PATH: `path1${sep}path2`,

  // Set inputs
  INPUT_MY_INPUT: "val",
  INPUT_MISSING: "",
  "INPUT_SPECIAL_CHARS_'\t\"\\": "'\t\"\\ response ",
  INPUT_MULTIPLE_SPACES_VARIABLE: "I have multiple spaces",
  INPUT_BOOLEAN_INPUT: "true",
  INPUT_BOOLEAN_INPUT_TRUE1: "true",
  INPUT_BOOLEAN_INPUT_TRUE2: "True",
  INPUT_BOOLEAN_INPUT_TRUE3: "TRUE",
  INPUT_BOOLEAN_INPUT_FALSE1: "false",
  INPUT_BOOLEAN_INPUT_FALSE2: "False",
  INPUT_BOOLEAN_INPUT_FALSE3: "FALSE",
  INPUT_WRONG_BOOLEAN_INPUT: "wrong",
  INPUT_WITH_TRAILING_WHITESPACE: "  some val  ",

  INPUT_MY_INPUT_LIST: "val1\nval2\nval3",

  // Save inputs
  STATE_TEST_1: "state_val",

  // File Commands
  GITHUB_PATH: "",
  GITHUB_ENV: "",
};

describe("core", () => {
  beforeAll(() => {
    const filePath = path.join(__dirname, `test`);

    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(filePath);
    }
  });

  beforeEach(() => {
    for (const key in testEnvVars) {
      Deno.env.set(key, testEnvVars[key as keyof typeof testEnvVars]);
    }

    //@ts-ignore should not actually write to stdout while testing
    Deno.stdout.write = mockFunction();
  });

  it("legacy exportVariable produces the correct command and sets the env", () => {
    core.exportVariable("my var", "var val");

    fixtures.assertWriteCalls([`::set-env name=my var::var val${eol}`]);
  });

  it("legacy exportVariable escapes variable names", () => {
    core.exportVariable("special char var \r\n,:", "special val");

    assertEquals(Deno.env.get("special char var \r\n,:"), "special val");

    fixtures.assertWriteCalls([
      `::set-env name=special char var %0D%0A%2C%3A::special val${eol}`,
    ]);
  });

  it("legacy exportVariable escapes variable values", () => {
    core.exportVariable("my var2", "var val\r\n");

    assertEquals(Deno.env.get("my var2"), "var val\r\n");

    fixtures.assertWriteCalls([`::set-env name=my var2::var val%0D%0A${eol}`]);
  });

  it("legacy exportVariable handles boolean inputs", () => {
    core.exportVariable("my var", true);

    fixtures.assertWriteCalls([`::set-env name=my var::true${eol}`]);
  });

  it("legacy exportVariable handles number inputs", () => {
    core.exportVariable("my var", 5);

    fixtures.assertWriteCalls([`::set-env name=my var::5${eol}`]);
  });

  it("exportVariable produces the correct command and sets the env", () => {
    const command = "ENV";

    fixtures.createFileCommandFile(command);

    core.exportVariable("my var", "var val");

    fixtures.verifyFileCommand(
      command,
      `my var<<_GitHubActionsFileCommandDelimeter_${eol}var val${eol}_GitHubActionsFileCommandDelimeter_${eol}`
    );
  });

  it("exportVariable handles boolean inputs", () => {
    const command = "ENV";

    fixtures.createFileCommandFile(command);

    core.exportVariable("my var", true);

    fixtures.verifyFileCommand(
      command,
      `my var<<_GitHubActionsFileCommandDelimeter_${eol}true${eol}_GitHubActionsFileCommandDelimeter_${eol}`
    );
  });

  it("exportVariable handles number inputs", () => {
    const command = "ENV";

    fixtures.createFileCommandFile(command);

    core.exportVariable("my var", 5);

    fixtures.verifyFileCommand(
      command,
      `my var<<_GitHubActionsFileCommandDelimeter_${eol}5${eol}_GitHubActionsFileCommandDelimeter_${eol}`
    );
  });

  it("setSecret produces the correct command", () => {
    core.setSecret("secret val");

    fixtures.assertWriteCalls([`::add-mask::secret val${eol}`]);
  });

  it("prependPath produces the correct commands and sets the env", () => {
    const command = "PATH";

    fixtures.createFileCommandFile(command);

    core.addPath("myPath");

    assertEquals(Deno.env.get("PATH"), `myPath${sep}path1${sep}path2`);

    fixtures.verifyFileCommand(command, `myPath${eol}`);
  });

  it("legacy prependPath produces the correct commands and sets the env", () => {
    core.addPath("myPath");

    assertEquals(Deno.env.get("PATH"), `myPath${sep}path1${sep}path2`);

    fixtures.assertWriteCalls([`::add-path::myPath${eol}`]);
  });

  it("getInput gets non-required input", () => {
    assertEquals(core.getInput("my input"), "val");
  });

  it("getInput gets required input", () => {
    assertEquals(core.getInput("my input", { required: true }), "val");
  });

  it("getInput throws on missing required input", () => {
    assertThrows(
      () => core.getInput("missing", { required: true }),
      undefined,
      "Input required and not supplied: missing"
    );
  });

  it("getInput does not throw on missing non-required input", () => {
    assertEquals(core.getInput("missing", { required: false }), "");
  });

  it("getInput is case insensitive", () => {
    assertEquals(core.getInput("My InPuT"), "val");
  });

  it("getInput handles special characters", () => {
    assertEquals(core.getInput("special chars_'\t\"\\"), "'\t\"\\ response");
  });

  it("getInput handles multiple spaces", () => {
    assertEquals(
      core.getInput("multiple spaces variable"),
      "I have multiple spaces"
    );
  });

  it("getMultilineInput works", () => {
    assertEquals(core.getMultilineInput("my input list"), [
      "val1",
      "val2",
      "val3",
    ]);
  });

  it("getInput trims whitespace by default", () => {
    assertEquals(core.getInput("with trailing whitespace"), "some val");
  });

  it("getInput trims whitespace when option is explicitly true", () => {
    assertEquals(
      core.getInput("with trailing whitespace", { trimWhitespace: true }),
      "some val"
    );
  });

  it("getInput does not trim whitespace when option is false", () => {
    assertEquals(
      core.getInput("with trailing whitespace", { trimWhitespace: false }),
      "  some val  "
    );
  });

  it("getInput gets non-required boolean input", () => {
    assertEquals(core.getBooleanInput("boolean input"), true);
  });

  it("getInput gets required input", () => {
    assertEquals(
      core.getBooleanInput("boolean input", { required: true }),
      true
    );
  });

  it("getBooleanInput handles boolean input", () => {
    assertEquals(core.getBooleanInput("boolean input true1"), true);
    assertEquals(core.getBooleanInput("boolean input true2"), true);
    assertEquals(core.getBooleanInput("boolean input true3"), true);
    assertEquals(core.getBooleanInput("boolean input false1"), false);
    assertEquals(core.getBooleanInput("boolean input false2"), false);
    assertEquals(core.getBooleanInput("boolean input false3"), false);
  });

  it("getBooleanInput handles wrong boolean input", () => {
    assertThrows(
      () => core.getBooleanInput("wrong boolean input"),
      undefined,
      'Input does not meet YAML 1.2 "Core Schema" specification: wrong boolean input\n' +
        `Support boolean input list: \`true | True | TRUE | false | False | FALSE\``
    );
  });

  it("setOutput produces the correct command", () => {
    core.setOutput("some output", "some value");

    fixtures.assertWriteCalls([
      eol,
      `::set-output name=some output::some value${eol}`,
    ]);
  });

  it("setOutput handles bools", () => {
    core.setOutput("some output", false);

    fixtures.assertWriteCalls([
      eol,
      `::set-output name=some output::false${eol}`,
    ]);
  });

  it("setOutput handles numbers", () => {
    core.setOutput("some output", 1.01);

    fixtures.assertWriteCalls([
      eol,
      `::set-output name=some output::1.01${eol}`,
    ]);
  });

  it("setFailed throws to prevent action success", () => {
    assertThrows(() => {
      core.setFailed("Failure message");
    });
  });

  it("setFailed sets the correct exit code and failure message", () => {
    try {
      core.setFailed("Failure message");
    } catch {
      fixtures.assertWriteCalls([`::error::Failure message${eol}`]);
    }
  });

  it("setFailed escapes the failure message", () => {
    try {
      core.setFailed("Failure \r\n\nmessage\r");
    } catch {
      fixtures.assertWriteCalls([`::error::Failure %0D%0A%0Amessage%0D${eol}`]);
    }
  });

  it("setFailed handles Error", () => {
    const message = "this is my error message";

    try {
      core.setFailed(new Error(message));
    } catch {
      fixtures.assertWriteCalls([`::error::Error: ${message}${eol}`]);
    }
  });

  it("error throws to prevent action success", () => {
    assertThrows(() => {
      core.error("Error message");
    });
  });

  it("error sets the correct error message", () => {
    try {
      core.error("Error message");
    } catch {
      fixtures.assertWriteCalls([`::error::Error message${eol}`]);
    }
  });

  it("error escapes the error message", () => {
    try {
      core.error("Error message\r\n\n");
    } catch {
      fixtures.assertWriteCalls([`::error::Error message%0D%0A%0A${eol}`]);
    }
  });

  it("error handles an error object", () => {
    const message = "this is my error message";

    try {
      core.error(new Error(message));
    } catch {
      fixtures.assertWriteCalls([`::error::Error: ${message}${eol}`]);
    }
  });

  it("error handles parameters correctly", () => {
    const message = "this is my error message";

    try {
      core.error(new Error(message), {
        title: "A title",
        file: "root/test.txt",
        startColumn: 1,
        endColumn: 2,
        startLine: 5,
        endLine: 5,
      });
    } catch {
      fixtures.assertWriteCalls([
        `::error title=A title,file=root/test.txt,line=5,endLine=5,col=1,endColumn=2::Error: ${message}${eol}`,
      ]);
    }
  });

  it("warning sets the correct message", () => {
    core.warning("Warning");

    fixtures.assertWriteCalls([`::warning::Warning${eol}`]);
  });

  it("warning escapes the message", () => {
    core.warning("\r\nwarning\n");

    fixtures.assertWriteCalls([`::warning::%0D%0Awarning%0A${eol}`]);
  });

  it("warning handles an error object", () => {
    const message = "this is my error message";

    core.warning(new Error(message));

    fixtures.assertWriteCalls([`::warning::Error: ${message}${eol}`]);
  });

  it("warning handles parameters correctly", () => {
    const message = "this is my error message";

    core.warning(new Error(message), {
      title: "A title",
      file: "root/test.txt",
      startColumn: 1,
      endColumn: 2,
      startLine: 5,
      endLine: 5,
    });

    fixtures.assertWriteCalls([
      `::warning title=A title,file=root/test.txt,line=5,endLine=5,col=1,endColumn=2::Error: ${message}${eol}`,
    ]);
  });

  it("notice sets the correct message", () => {
    core.notice("Notice");

    fixtures.assertWriteCalls([`::notice::Notice${eol}`]);
  });

  it("notice escapes the message", () => {
    core.notice("\r\nnotice\n");

    fixtures.assertWriteCalls([`::notice::%0D%0Anotice%0A${eol}`]);
  });

  it("notice handles an error object", () => {
    const message = "this is my error message";

    core.notice(new Error(message));

    fixtures.assertWriteCalls([`::notice::Error: ${message}${eol}`]);
  });

  it("notice handles parameters correctly", () => {
    const message = "this is my error message";

    core.notice(new Error(message), {
      title: "A title",
      file: "root/test.txt",
      startColumn: 1,
      endColumn: 2,
      startLine: 5,
      endLine: 5,
    });

    fixtures.assertWriteCalls([
      `::notice title=A title,file=root/test.txt,line=5,endLine=5,col=1,endColumn=2::Error: ${message}${eol}`,
    ]);
  });

  it("annotations map field names correctly", () => {
    const commandProperties = toCommandProperties({
      title: "A title",
      file: "root/test.txt",
      startColumn: 1,
      endColumn: 2,
      startLine: 5,
      endLine: 5,
    });

    assertEquals(commandProperties.title, "A title");
    assertEquals(commandProperties.file, "root/test.txt");
    assertEquals(commandProperties.col, 1);
    assertEquals(commandProperties.endColumn, 2);
    assertEquals(commandProperties.line, 5);
    assertEquals(commandProperties.endLine, 5);
    assertEquals(commandProperties.startColumn, undefined);
    assertEquals(commandProperties.startLine, undefined);
  });

  it("startGroup starts a new group", () => {
    core.startGroup("my-group");

    fixtures.assertWriteCalls([`::group::my-group${eol}`]);
  });

  it("endGroup ends new group", () => {
    core.endGroup();

    fixtures.assertWriteCalls([`::endgroup::${eol}`]);
  });

  it("group wraps an async call in a group", async () => {
    const result = await core.group("mygroup", async () => {
      await Deno.stdout.write(textEncoder.encode("in my group\n"));
      return true;
    });

    assertEquals(result, true);

    fixtures.assertWriteCalls([
      `::group::mygroup${eol}`,
      "in my group\n",
      `::endgroup::${eol}`,
    ]);
  });

  it("debug sets the correct message", () => {
    core.debug("Debug");

    fixtures.assertWriteCalls([`::debug::Debug${eol}`]);
  });

  it("debug escapes the message", () => {
    core.debug("\r\ndebug\n");

    fixtures.assertWriteCalls([`::debug::%0D%0Adebug%0A${eol}`]);
  });

  it("saveState produces the correct command", () => {
    core.saveState("state_1", "some value");

    fixtures.assertWriteCalls([`::save-state name=state_1::some value${eol}`]);
  });

  it("saveState handles numbers", () => {
    core.saveState("state_1", 1);

    fixtures.assertWriteCalls([`::save-state name=state_1::1${eol}`]);
  });

  it("saveState handles bools", () => {
    core.saveState("state_1", true);

    fixtures.assertWriteCalls([`::save-state name=state_1::true${eol}`]);
  });

  it("getState gets wrapper action state", () => {
    assertEquals(core.getState("TEST_1"), "state_val");
  });

  it("isDebug check debug state", () => {
    const current = Deno.env.get("RUNNER_DEBUG") || "";

    try {
      Deno.env.delete("RUNNER_DEBUG");
      assertEquals(core.isDebug(), false);

      Deno.env.set("RUNNER_DEBUG", "1");
      assertEquals(core.isDebug(), true);
    } finally {
      Deno.env.set("RUNNER_DEBUG", current);
    }
  });

  it("setCommandEcho can enable echoing", () => {
    core.setCommandEcho(true);

    fixtures.assertWriteCalls([`::echo::on${eol}`]);
  });

  it("setCommandEcho can disable echoing", () => {
    core.setCommandEcho(false);

    fixtures.assertWriteCalls([`::echo::off${eol}`]);
  });
});

// TODO : implement oidc
// describe("oidc-client-tests", () => {
//   it("Get Http Client", async () => {
//     const http = new HttpClient("actions/oidc-client");
//     expect(http).toBeDefined();
//   });

//   it("HTTP get request to get token endpoint", async () => {
//     const http = new HttpClient("actions/oidc-client");
//     const res = await http.get(getTokenEndPoint());
//     expect(res.message.statusCode).toBe(200);
//   });
// });
