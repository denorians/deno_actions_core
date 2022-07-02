# Contributing

## Issues

Do not submit duplicate issues. Follow issue templates in good faith. It is okay
to submit both an issue and a pull request (PR) resolving said issue. It is also
okay to submit a PR by itself with no accompanying issue.

## Code

### Dependencies

- [`deno`](https://deno.land/#installation) (v1.23.1)
- [deno VS Code extension](https://marketplace.visualstudio.com/items?itemName=denoland.vscode-deno)

### Testing

Four flags are required when running tests:

`deno test --allow-read --allow-write --allow-env --unstable`

### Style

Adhere to [Deno's default linting rules](https://deno.land/manual/tools/linter)
where reasonably possible. The included
[VS Code](https://code.visualstudio.com/) configuration will ensure this upon
saving files.

### Pull Requests

Do not submit duplicate PRs.

Here are the steps for successfully submitting a PR:

1. Fork this repository
2. Make your changes in a new branch, **including any relevant test cases**:
   ```shell
   git checkout -b some-branch main
   ```
3. Commit
4. Push like so:
   ```shell
   git push origin some-branch
   ```
5. On GitHub, submit a pull request to `deno_actions_core:main`
6. If changes are requested for your pull request:
   1. Make those changes
   2. Ensure all tests pass
   3. Rebase and force push:
      ```shell
      git rebase main -i
      git push -f
      ```
