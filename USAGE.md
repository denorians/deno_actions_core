# Usage

> Core functions for setting results, logging, registering secrets and exporting
> variables across actions

## Deno permissions

This module requires these flags:

- `--allow-read`
- `--allow-write`
- `--allow-env`

## Inputs/outputs

Action inputs can be read with `getInput`, returning a `string` or
`getBooleanInput`. Booleans parse according to the
[yaml 1.2 specification](https://yaml.org/spec/1.2/spec.html#id2804923). Thus,
if `required` is `false`, the input should have a default value in `action.yml`.

Outputs may be set with `setOutput` which makes them available to be mapped into
inputs of other actions, ensuring they are decoupled.

```typescript
const myInput = core.getInput("inputName", { required: true });

const myBooleanInput = core.getBooleanInput("booleanInputName", {
  required: true,
});

const myMultilineInput = core.getMultilineInput("multilineInputName", {
  required: true,
});

core.setOutput("outputKey", "outputVal");
```

## Exporting variables

Since each step runs in a separate process, you can use `exportVariable` to add
it to this and future steps.

```typescript
core.exportVariable("envVar", "Val");
```

## Setting a secret

Setting a secret registers it with the runner to ensure masking in the logs.

```typescript
core.setSecret("myPassword");
```

## PATH manipulation

To make a tool's path available in the path for the remainder of the job
(without altering the machine or container's state), use `addPath`. The runner
will prepend the path given to the job's `PATH`.

```typescript
core.addPath("/path/to/mytool");
```

## Failure handling

You may use this module to set the failure condition for your action. If this is
not set, and the script runs to completion, then that will lead to a success.

```typescript
import * as core from "https://deno.land/x/deno_actions_core/mod.ts";

try {
  // Do stuff
} catch (err) {
  // setFailed logs the message
  core.setFailed(`Action failed with error ${err}`);
}
```

## Logging

This module provides utilities for logging. Note that debug logging is hidden by
default. This behavior can be toggled by
[setting the secret](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/creating-and-using-encrypted-secrets#creating-encrypted-secrets)
`ACTIONS_STEP_DEBUG` to `true`.

All actions run while this secret is enabled will show debug events in the
[Downloaded Logs](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/managing-a-workflow-run#downloading-logs)
and
[Web Logs](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/managing-a-workflow-run#viewing-logs-to-diagnose-failures).

Here's logging in action (no pun intended):

```typescript
import * as core from "https://deno.land/x/deno_actions_core/mod.ts";

const myInput = core.getInput("input");

try {
  core.debug("Inside try block");

  if (!myInput) {
    core.warning("myInput was not set");
  }

  if (core.isDebug()) {
    // curl -v https://github.com
  } else {
    // curl https://github.com
  }

  // Do stuff

  core.info("Output to the actions build log");

  core.notice("This is a message that will also emit an annotation");
} catch (err) {
  core.error(`Error ${err}, action may still succeed though`);
}
```

This module can also wrap chunks of output into foldable groups:

```typescript
import * as core from "https://deno.land/x/deno_actions_core/mod.ts";

// Manually wrap output
core.startGroup("Do some function");
doSomeFunction();
core.endGroup();

// Wrap an asynchronous function call
const result = await core.group("Do something async", async () => {
  const response = await doSomeHTTPRequest();
  return response;
});
```

## Annotations

This module has three methods that will produce
[annotations](https://docs.github.com/en/rest/reference/checks#create-a-check-run).

```typescript
core.error("This is an error that will fail the build.");

core.warning(
  "Something went wrong, but it's not bad enough to fail the build.",
);

core.notice("Something happened that you might want to know about.");
```

These annotations will surface to the UI in the Actions page and via pull
requests. They can be attached to particular lines and columns of your source
files to show exactly where a problem is occuring. Here are the options:

```typescript
export interface AnnotationProperties {
  /**
   * A title for the annotation.
   */
  title?: string;

  /**
   * The name of the file for which the annotation should be created.
   */
  file?: string;

  /**
   * The start line for the annotation.
   */
  startLine?: number;

  /**
   * The end line for the annotation. Defaults to `startLine` when `startLine` is provided.
   */
  endLine?: number;

  /**
   * The start column for the annotation. Cannot be sent when `startLine` and `endLine` are different values.
   */
  startColumn?: number;

  /**
   * The start column for the annotation. Cannot be sent when `startLine` and `endLine` are different values.
   * Defaults to `startColumn` when `startColumn` is provided.
   */
  endColumn?: number;
}
```

## Styling output

Colored output is supported in the action's logs via standard
[ANSI escape codes](https://en.wikipedia.org/wiki/ANSI_escape_code). 3/4bit,
8bit, and 24bit colors are all supported.

### Foreground colors

```typescript
// 3/4bit
core.info("\u001b[35mThis foreground will be magenta");

// 8bit
core.info("\u001b[38;5;6mThis foreground will be cyan");

// 24bit
core.info("\u001b[38;2;255;0;0mThis foreground will be bright red");
```

### Background colors

```typescript
// 3/4bit
core.info("\u001b[43mThis background will be yellow");

// 8bit
core.info("\u001b[48;5;6mThis background will be cyan");

// 24bit
core.info("\u001b[48;2;255;0;0mThis background will be bright red");
```

Special styles:

```typescript
core.info("\u001b[1mBold text");
core.info("\u001b[3mItalic text");
core.info("\u001b[4mUnderlined text");
```

ANSI escape codes can be combined with one another:

```typescript
core.info(
  "\u001b[31;46mRed foreground with a cyan background and \u001b[1mbold text at the end",
);
```

> Note: Escape codes reset at the start of each line

```typescript
core.info("\u001b[35mThis foreground will be magenta");
core.info("This foreground will reset to the default");
```

Since manually typing escape codes is tedious, you might consider using a
third-party module for colors.

## Action state

You can use this module to save state, and get state, for sharing information in
a wrapper action:

```typescript
import * as core from "https://deno.land/x/deno_actions_core/mod.ts";

// For main entry point
core.saveState("pidToKill", 12345);

// For cleaning up (post)
process.kill(core.getState("pidToKill"));
```

## Job summaries

Add custom Markdown
[job summaries](https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions#adding-a-job-summary)
like this:

```typescript
await core.summary
  .addHeading("Test Results")
  .addTable([
    [{ data: "File", header: true }, { data: "Result", header: true }],
    ["foo.ts", "Pass ✅"],
    ["bar.ts", "Fail ❌"],
    ["foo.ts", "Pass ✅"],
  ])
  .addDetails(
    "📚 View raw output",
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  )
  .addQuote("With great power comes great responsibility")
  .addLink("Check out this site!", "https://github.com")
  .addSeparator()
  .write();
```

## Filesystem path helpers

You can use these methods to manipulate file paths across operating systems:

```typescript
core.toPosixPath("\\foo\\bar"); // => /foo/bar
core.toWin32Path("/foo/bar"); // => \foo\bar
```

Alternatively, `toPlatformPath` converts input paths to the expected value on
the runner's operating system:

```typescript
// On a Windows runner.
core.toPlatformPath("/foo/bar"); // => \foo\bar

// On a Linux runner.
core.toPlatformPath("\\foo\\bar"); // => /foo/bar
```

## OIDC token

Not yet implemented.
