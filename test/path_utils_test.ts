import { toPlatformPath, toPosixPath, toWin32Path } from "../src/path_utils.ts";

import { assertEquals, describe, it, join } from "../test_deps.ts";

import { sep } from "../deps.ts";

describe("path utils", () => {
  describe("toPosixPath", () => {
    const cases: {
      only?: boolean;
      name: string;
      input: string;
      expected: string;
    }[] = [
      {
        name: "empty string",
        input: "",
        expected: "",
      },
      {
        name: "single value",
        input: "foo",
        expected: "foo",
      },
      {
        name: "with posix relative",
        input: "foo/bar/baz",
        expected: "foo/bar/baz",
      },
      {
        name: "with posix absolute",
        input: "/foo/bar/baz",
        expected: "/foo/bar/baz",
      },
      {
        name: "with win32 relative",
        input: "foo\\bar\\baz",
        expected: "foo/bar/baz",
      },
      {
        name: "with win32 absolute",
        input: "\\foo\\bar\\baz",
        expected: "/foo/bar/baz",
      },
      {
        name: "with a mix",
        input: "\\foo/bar/baz",
        expected: "/foo/bar/baz",
      },
    ];

    for (const testCase of cases) {
      const fn = testCase.only ? it.only : it;

      fn(testCase.name, () => {
        assertEquals(toPosixPath(testCase.input), testCase.expected);
      });
    }
  });

  describe("toWin32Path", () => {
    const cases: {
      only?: boolean;
      name: string;
      input: string;
      expected: string;
    }[] = [
      {
        name: "empty string",
        input: "",
        expected: "",
      },
      {
        name: "single value",
        input: "foo",
        expected: "foo",
      },
      {
        name: "with posix relative",
        input: "foo/bar/baz",
        expected: "foo\\bar\\baz",
      },
      {
        name: "with posix absolute",
        input: "/foo/bar/baz",
        expected: "\\foo\\bar\\baz",
      },
      {
        name: "with win32 relative",
        input: "foo\\bar\\baz",
        expected: "foo\\bar\\baz",
      },
      {
        name: "with win32 absolute",
        input: "\\foo\\bar\\baz",
        expected: "\\foo\\bar\\baz",
      },
      {
        name: "with a mix",
        input: "\\foo/bar\\baz",
        expected: "\\foo\\bar\\baz",
      },
    ];

    for (const testCase of cases) {
      const fn = testCase.only ? it.only : it;

      fn(testCase.name, () => {
        assertEquals(toWin32Path(testCase.input), testCase.expected);
      });
    }
  });

  describe("toPlatformPath", () => {
    const cases: {
      only?: boolean;
      name: string;
      input: string;
      expected: string;
    }[] = [
      {
        name: "empty string",
        input: "",
        expected: "",
      },
      {
        name: "single value",
        input: "foo",
        expected: "foo",
      },
      {
        name: "with posix relative",
        input: "foo/bar/baz",
        expected: join("foo", "bar", "baz"),
      },
      {
        name: "with posix absolute",
        input: "/foo/bar/baz",
        expected: join(sep, "foo", "bar", "baz"),
      },
      {
        name: "with win32 relative",
        input: "foo\\bar\\baz",
        expected: join("foo", "bar", "baz"),
      },
      {
        name: "with win32 absolute",
        input: "\\foo\\bar\\baz",
        expected: join(sep, "foo", "bar", "baz"),
      },
      {
        name: "with a mix",
        input: "\\foo/bar\\baz",
        expected: join(sep, "foo", "bar", "baz"),
      },
    ];

    for (const testCase of cases) {
      const fn = testCase.only ? it.only : it;
      fn(testCase.name, () => {
        assertEquals(toPlatformPath(testCase.input), testCase.expected);
      });
    }
  });
});
