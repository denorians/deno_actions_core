// deno-lint-ignore-file
// deno-lint-ignore-file no-explicit-any

import { AnnotationProperties } from "../mod.ts";
import { CommandProperties } from "./command.ts";

import { SEP } from "https://deno.land/std@0.129.0/path/separator.ts";
import { EOL } from "https://deno.land/std@0.129.0/fs/eol.ts";
import {
  dirname,
  fromFileUrl,
} from "https://deno.land/std@0.129.0/path/mod.ts";

export const __dirname = dirname(fromFileUrl(import.meta.url));
export const sep = SEP;
export const eol: string = Deno.build.os === "windows" ? EOL.CRLF : EOL.LF;
export const textEncoder = new TextEncoder();

/**
 * Sanitizes an input into a string so it can be passed into issueCommand safely
 * @param input input to sanitize into a string
 */
export function toCommandValue(input: any): string {
  if (input === null || input === undefined) {
    return "";
  } else if (typeof input === "string" || input instanceof String) {
    return input as string;
  }

  return JSON.stringify(input);
}

/**
 * @param annotationProperties
 * @returns The command properties to send with the actual annotation command
 * See IssueCommandProperties: https://github.com/actions/runner/blob/main/src/Runner.Worker/ActionCommandManager.cs#L646
 */
export function toCommandProperties(
  annotationProperties: AnnotationProperties,
): CommandProperties {
  if (!Object.keys(annotationProperties).length) {
    return {};
  }

  return {
    title: annotationProperties.title,
    file: annotationProperties.file,
    line: annotationProperties.startLine,
    endLine: annotationProperties.endLine,
    col: annotationProperties.startColumn,
    endColumn: annotationProperties.endColumn,
  };
}

// TODO : move to a test module

const idToMockFunctionMap = new Map<number, MockFunctionData>();
const mockFunctionToIdMap = new Map<Function, number>();

let mockFunctionId = 0;

class MockFunctionData {
  protected id: number;
  protected callCount: number;
  protected func: Function;

  constructor() {
    this.id = mockFunctionId++;
    this.callCount = 0;
    this.func = () => {};

    idToMockFunctionMap.set(this.id, this);

    this.setFunction(() => {
      this.incrementCallCount();
    });

    mockFunctionToIdMap.set(
      this.getFunction(),
      this.id,
    );
  }

  getFunction(): Function {
    return this.func;
  }

  setFunction(func: Function): void {
    this.func = func;
  }

  getCallCount(): number {
    return this.callCount;
  }

  incrementCallCount(): void {
    ++this.callCount;
  }
}

export function mockFunction(): Function {
  const mockFunctionData = new MockFunctionData();

  return mockFunctionData.getFunction();
}

export function assertToHaveBeenCalledTimes(
  func: Function,
  callCount: number,
): boolean {
  const id = mockFunctionToIdMap.get(func) || 0;

  return idToMockFunctionMap.get(id)?.getCallCount() === callCount;
}
