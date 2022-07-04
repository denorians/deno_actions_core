import { summary, SUMMARY_ENV_VAR } from "../src/summary.ts";

import { __dirname } from "../src/utils.ts";

import { eol } from "../src/utils.ts";

import {
  afterAll,
  assertEquals,
  assertRejects,
  beforeEach,
  describe,
  it,
  join,
} from "../test_deps.ts";

import {
  mkdir,
  readFile,
  unlink,
  writeFile,
} from "https://deno.land/std@0.146.0/node/fs/promises.ts";

const testDirectoryPath = join(__dirname, "test");
const testFilePath = join(testDirectoryPath, "test-summary.md");

async function assertSummary(expected: string): Promise<void> {
  const file = await readFile(testFilePath, { encoding: "utf8" });

  assertEquals(file, expected);
}

const fixtures = {
  text: "hello world 🌎",
  code: `func fork() {
  for {
    go fork()
  }
}`,
  list: ["foo", "bar", "baz", "💣"],
  table: [
    [
      {
        data: "foo",
        header: true,
      },
      {
        data: "bar",
        header: true,
      },
      {
        data: "baz",
        header: true,
      },
      {
        data: "tall",
        rowspan: "3",
      },
    ],
    ["one", "two", "three"],
    [
      {
        data: "wide",
        colspan: "3",
      },
    ],
  ],
  details: {
    label: "open me",
    content: "🎉 surprise",
  },
  img: {
    src: "https://github.com/actions.png",
    alt: "actions logo",
    options: {
      width: "32",
      height: "32",
    },
  },
  quote: {
    text: "Where the world builds software",
    cite: "https://github.com/about",
  },
  link: {
    text: "GitHub",
    href: "https://github.com/",
  },
};

describe("summary", () => {
  beforeEach(async () => {
    Deno.env.set(SUMMARY_ENV_VAR, testFilePath);
    await mkdir(testDirectoryPath, { recursive: true });

    await writeFile(testFilePath, "", { encoding: "utf8" });

    summary.emptyBuffer();
  });

  afterAll(async () => {
    await unlink(testFilePath);
  });

  it("throws if summary env var is undefined", async () => {
    Deno.env.delete(SUMMARY_ENV_VAR);

    await assertRejects(() => summary.addRaw(fixtures.text).write());
  });

  it("throws if summary file does not exist", async () => {
    await unlink(testFilePath);

    await assertRejects(() => summary.addRaw(fixtures.text).write());
  });

  it("appends text to summary file", async () => {
    await writeFile(testFilePath, "# ", { encoding: "utf8" });

    await summary.addRaw(fixtures.text).write();

    await assertSummary(`# ${fixtures.text}`);
  });

  it("overwrites text to summary file", async () => {
    await writeFile(testFilePath, "overwrite", {
      encoding: "utf8",
    });

    await summary.addRaw(fixtures.text).write({ overwrite: true });

    await assertSummary(fixtures.text);
  });

  it("appends text with EOL to summary file", async () => {
    await writeFile(testFilePath, "# ", { encoding: "utf8" });

    await summary.addRaw(fixtures.text, true).write();

    await assertSummary(`# ${fixtures.text}${eol}`);
  });

  it("chains appends text to summary file", async () => {
    await writeFile(testFilePath, "", { encoding: "utf8" });

    await summary
      .addRaw(fixtures.text)
      .addRaw(fixtures.text)
      .addRaw(fixtures.text)
      .write();

    await assertSummary([fixtures.text, fixtures.text, fixtures.text].join(""));
  });

  it("empties buffer after write", async () => {
    await writeFile(testFilePath, "", { encoding: "utf8" });
    await summary.addRaw(fixtures.text).write();
    await assertSummary(fixtures.text);

    assertEquals(summary.isEmptyBuffer(), true);
  });

  it("returns summary buffer as string", () => {
    summary.addRaw(fixtures.text);

    assertEquals(summary.stringify(), fixtures.text);
  });

  it("return correct values for isEmptyBuffer", () => {
    summary.addRaw(fixtures.text);

    assertEquals(summary.isEmptyBuffer(), false);

    summary.emptyBuffer();

    assertEquals(summary.isEmptyBuffer(), true);
  });

  it("clears a buffer and summary file", async () => {
    await writeFile(testFilePath, "content", { encoding: "utf8" });
    await summary.clear();
    await assertSummary("");

    assertEquals(summary.isEmptyBuffer(), true);
  });

  it("adds EOL", async () => {
    await summary
      .addRaw(fixtures.text)
      .addEOL()
      .write();

    await assertSummary(fixtures.text + eol);
  });

  it("adds a code block without language", async () => {
    await summary.addCodeBlock(fixtures.code).write();

    const expected =
      `<pre><code>func fork() {\n  for {\n    go fork()\n  }\n}</code></pre>${eol}`;

    await assertSummary(expected);
  });

  it("adds a code block with a language", async () => {
    await summary.addCodeBlock(fixtures.code, "go").write();

    const expected =
      `<pre lang="go"><code>func fork() {\n  for {\n    go fork()\n  }\n}</code></pre>${eol}`;

    await assertSummary(expected);
  });

  it("adds an unordered list", async () => {
    await summary.addList(fixtures.list).write();

    const expected =
      `<ul><li>foo</li><li>bar</li><li>baz</li><li>💣</li></ul>${eol}`;

    await assertSummary(expected);
  });

  it("adds an ordered list", async () => {
    await summary.addList(fixtures.list, true).write();

    const expected =
      `<ol><li>foo</li><li>bar</li><li>baz</li><li>💣</li></ol>${eol}`;

    await assertSummary(expected);
  });

  it("adds a table", async () => {
    await summary.addTable(fixtures.table).write();

    const expected =
      `<table><tr><th>foo</th><th>bar</th><th>baz</th><td rowspan="3">tall</td></tr><tr><td>one</td><td>two</td><td>three</td></tr><tr><td colspan="3">wide</td></tr></table>${eol}`;

    await assertSummary(expected);
  });

  it("adds a details element", async () => {
    await summary
      .addDetails(fixtures.details.label, fixtures.details.content)
      .write();

    const expected =
      `<details><summary>open me</summary>🎉 surprise</details>${eol}`;

    await assertSummary(expected);
  });

  it("adds an image with alt text", async () => {
    await summary.addImage(fixtures.img.src, fixtures.img.alt).write();

    const expected =
      `<img src="https://github.com/actions.png" alt="actions logo">${eol}`;

    await assertSummary(expected);
  });

  it("adds an image with custom dimensions", async () => {
    await summary
      .addImage(fixtures.img.src, fixtures.img.alt, fixtures.img.options)
      .write();

    const expected =
      `<img src="https://github.com/actions.png" alt="actions logo" width="32" height="32">${eol}`;

    await assertSummary(expected);
  });

  it("adds an image with custom dimensions", async () => {
    await summary
      .addImage(fixtures.img.src, fixtures.img.alt, fixtures.img.options)
      .write();

    const expected =
      `<img src="https://github.com/actions.png" alt="actions logo" width="32" height="32">${eol}`;

    await assertSummary(expected);
  });

  it("adds headings h1...h6", async () => {
    for (const i of [1, 2, 3, 4, 5, 6]) {
      summary.addHeading("heading", i);
    }

    await summary.write();

    const expected =
      `<h1>heading</h1>${eol}<h2>heading</h2>${eol}<h3>heading</h3>${eol}<h4>heading</h4>${eol}<h5>heading</h5>${eol}<h6>heading</h6>${eol}`;

    await assertSummary(expected);
  });

  it("adds h1 if heading level not specified", async () => {
    await summary.addHeading("heading").write();

    const expected = `<h1>heading</h1>${eol}`;

    await assertSummary(expected);
  });

  it("uses h1 if heading level is garbage or out of range", async () => {
    await summary
      .addHeading("heading", "foobar")
      .addHeading("heading", 1337)
      .addHeading("heading", -1)
      .addHeading("heading", Infinity)
      .write();

    const expected =
      `<h1>heading</h1>${eol}<h1>heading</h1>${eol}<h1>heading</h1>${eol}<h1>heading</h1>${eol}`;

    await assertSummary(expected);
  });

  it("adds a separator", async () => {
    await summary.addSeparator().write();

    const expected = `<hr>${eol}`;

    await assertSummary(expected);
  });

  it("adds a break", async () => {
    await summary.addBreak().write();

    const expected = `<br>${eol}`;

    await assertSummary(expected);
  });

  it("adds a quote", async () => {
    await summary.addQuote(fixtures.quote.text).write();

    const expected =
      `<blockquote>Where the world builds software</blockquote>${eol}`;

    await assertSummary(expected);
  });

  it("adds a quote with citation", async () => {
    await summary.addQuote(fixtures.quote.text, fixtures.quote.cite).write();

    const expected =
      `<blockquote cite="https://github.com/about">Where the world builds software</blockquote>${eol}`;

    await assertSummary(expected);
  });

  it("adds a link with href", async () => {
    await summary.addLink(fixtures.link.text, fixtures.link.href).write();

    const expected = `<a href="https://github.com/">GitHub</a>${eol}`;

    await assertSummary(expected);
  });
});
