# Contributing

## Issues

Do not submit duplicate issues. Follow issue templates in good faith. It is okay
to submit both an issue and a pull request (PR) resolving said issue. It is also
okay to submit a PR by itself with no accompanying issue.

## Code

### Tool dependencies

- [`deno`](https://deno.land/#installation): v1.21
- [deno VS Code extension](https://marketplace.visualstudio.com/items?itemName=denoland.vscode-deno)

### Running tests

Keep in mind that three flags are required:

`deno test --allow-read --allow-write --allow-env --unstable`

### Style

Adhere to [Deno's default linting rules](https://deno.land/manual/tools/linter)
where reasonably possible. The included
[VS Code](https://code.visualstudio.com/) configuration will ensure this upon
saving files.

### Committing, versioning, and releasing

This project adheres to a slight modification of
[Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/#summary).
Contributors needn't worry about this too much, since commits can be squashed
upon pull request acceptance. Note that scopes are not recommended for this
project, because it's not complex enough to warrant them.

The `fix`, `feat`, and `BREAKING CHANGE` types are all acceptable here.
Additionally, the exclamation mark (`!`) can be used to denote a breaking
change. That said, changes with no impact on [SemVer](https://semver.org/)
require no type, nor colon. In other words....

Do **not** do this:

`chore: add a badge to the README`

Do this instead:

`add a badge to the README`

Since changes with no effect on the project version require no type, the
following types, and nothing like them, should ever be included in commit
messages: `build`, `chore`, `ci`, `style`, `refactor`, `test`. (When there is no
needed type, there should be no `:` to delimit it.)

For more guidance, `feat` should be used in place of `perf`, because improving
performance is a feature. What others would call `docs` changes, actually
constitute corrections and clarifications, and so `fix` is most appropriate for
them; such documentation changes should in fact impact the software version,
because they can be published to third parties via new tags.

Furthermore, note that message subjects should be lowercase, with the exception
of names and stylizations. Messages should also be in the present tense.
Subjects should not be terminated with a period (`.`).

Finally, anticipate `release` commits. Their messages look like the following:

`release: v1.2.3`

Such commits are tagged appropriately.

### Pull requests

Do not submit duplicate PRs.

Here are the steps for successfully submitting a PR:

1. Fork this repository.
2. Make your changes in a new branch, **including any relevant test cases**:
   ```shell
   git checkout -b some-branch main
   ```
3. Commit.
4. Push like so:
   ```shell
   git push origin some-branch
   ```
5. On GitHub, submit a pull request to `deno_actions_core:main`.
6. If changes are requested for your pull request:
   1. Make those changes.
   2. Ensure all tests pass.
   3. Rebase and force push:
      ```shell
      git rebase main -i
      git push -f
      ```
