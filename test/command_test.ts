import * as command from "../src/command.ts";
import * as fixtures from "./fixtures.ts";

import { eol, mockFunction } from "../src/utils.ts";

import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  it,
} from "https://deno.land/x/test_suite@0.13.0/mod.ts";

let originalWriteFunction: (p: Uint8Array) => Promise<number>;

describe("command", () => {
  beforeAll(() => {
    originalWriteFunction = Deno.stdout.write;
  });

  beforeEach(() => {
    //@ts-ignore should not actually write to stdout while testing
    Deno.stdout.write = mockFunction();
  });

  afterEach(() => {});

  afterAll(() => {
    Deno.stdout.write = originalWriteFunction;
  });

  it("command only", () => {
    command.issueCommand("some-command", {}, "");
    fixtures.assertWriteCalls([`::some-command::${eol}`]);
  });

  it("command escapes message", () => {
    // Verify replaces each instance, not just first instance
    command.issueCommand(
      "some-command",
      {},
      "percent % percent % cr \r cr \r lf \n lf \n",
    );

    fixtures.assertWriteCalls([
      `::some-command::percent %25 percent %25 cr %0D cr %0D lf %0A lf %0A${eol}`,
    ]);

    // Verify literal escape sequences
    //@ts-ignore should not actually write to stdout while testing
    Deno.stdout.write = mockFunction();

    command.issueCommand("some-command", {}, "%25 %25 %0D %0D %0A %0A");

    fixtures.assertWriteCalls([
      `::some-command::%2525 %2525 %250D %250D %250A %250A${eol}`,
    ]);
  });

  it("command escapes property", () => {
    // Verify replaces each instance, not just first instance
    command.issueCommand(
      "some-command",
      {
        name:
          "percent % percent % cr \r cr \r lf \n lf \n colon : colon : comma , comma ,",
      },
      "",
    );

    fixtures.assertWriteCalls([
      `::some-command name=percent %25 percent %25 cr %0D cr %0D lf %0A lf %0A colon %3A colon %3A comma %2C comma %2C::${eol}`,
    ]);

    // Verify literal escape sequences
    //@ts-ignore should not actually write to stdout while testing
    Deno.stdout.write = mockFunction();

    command.issueCommand(
      "some-command",
      {},
      "%25 %25 %0D %0D %0A %0A %3A %3A %2C %2C",
    );

    fixtures.assertWriteCalls([
      `::some-command::%2525 %2525 %250D %250D %250A %250A %253A %253A %252C %252C${eol}`,
    ]);
  });

  it("command with message", () => {
    command.issueCommand("some-command", {}, "some message");

    fixtures.assertWriteCalls([`::some-command::some message${eol}`]);
  });

  it("command with message and properties", () => {
    command.issueCommand(
      "some-command",
      { prop1: "value 1", prop2: "value 2" },
      "some message",
    );

    fixtures.assertWriteCalls([
      `::some-command prop1=value 1,prop2=value 2::some message${eol}`,
    ]);
  });

  it("command with one property", () => {
    command.issueCommand("some-command", { prop1: "value 1" }, "");
    fixtures.assertWriteCalls([`::some-command prop1=value 1::${eol}`]);
  });

  it("command with two properties", () => {
    command.issueCommand(
      "some-command",
      { prop1: "value 1", prop2: "value 2" },
      "",
    );

    fixtures.assertWriteCalls([
      `::some-command prop1=value 1,prop2=value 2::${eol}`,
    ]);
  });

  it("command with three properties", () => {
    command.issueCommand(
      "some-command",
      { prop1: "value 1", prop2: "value 2", prop3: "value 3" },
      "",
    );

    fixtures.assertWriteCalls([
      `::some-command prop1=value 1,prop2=value 2,prop3=value 3::${eol}`,
    ]);
  });

  it("should handle issuing commands for non-string objects", () => {
    command.issueCommand(
      "some-command",
      {
        prop1: ({ test: "object" } as unknown) as string,
        prop2: (123 as unknown) as string,
        prop3: (true as unknown) as string,
      },
      ({ test: "object" } as unknown) as string,
    );

    fixtures.assertWriteCalls([
      `::some-command prop1={"test"%3A"object"},prop2=123,prop3=true::{"test":"object"}${eol}`,
    ]);
  });
});
