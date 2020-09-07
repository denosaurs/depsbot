<div align="center">
  <h1><code>depsbot</code></h1>
  <p>
    <strong>⚙️ GitHub action to check freshness of your deno dependencies</strong>
  </p>
  <br>
  <p align="center">
    <a alt="Tags" href="https://github.com/denosaurs/depsbot/releases">
      <img src="https://img.shields.io/github/release/denosaurs/depsbot" />
    </a>
      <a alt="CI Status" href="https://github.com/denosaurs/depsbot/actions">
      <img src="https://img.shields.io/github/workflow/status/denosaurs/depsbot/checks" />
    </a>
      <a alt="License" href="https://github.com/denosaurs/depsbot/blob/master/LICENSE">
      <img src="https://img.shields.io/github/license/denosaurs/depsbot" />
    </a>
  </p>
</div>

## Usage as a GitHub action

### Example Workflow file

An example workflow to authenticate with GitHub Platform:

```yaml
on:
  schedule:
    - cron: "0 0 * * *" # run depsbot everyday at 00:00 UTC
  push:
  pull_request: # but also check on push and pull requests

jobs:
  depsbot:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@master

      - name: Run depsbot
        uses: denosaurs/depsbot@master
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
```

### Inputs

| name         | value  | default | description                                                                     |
| ------------ | ------ | ------- | ------------------------------------------------------------------------------- |
| github_token | string |         | Token for the repo. Can be passed in using `${{ secrets.GITHUB_TOKEN }}`.       |
| path         | string | '.'     | If your deno project is in a subdirectory you specify where to run the depsbot. |
| repo_path    | string | '.'     | Path to your repository in the filesystem.                                      |

### Ignore Comments

If you to let depsbot know that a particular line or file shouldn't be checked you can add:

- `// depsbot-ignore` to ignore the next line

  ```typescript
  // depsbot-ignore
  import { red } from "https://deno.land/std@0.51.0/fmt/colors.ts";
  ```

- `// depsbot-ignore-file` to ignore the entire file

  ```typescript
  // depsbot-ignore
  import { red } from "https://deno.land/std@0.51.0/fmt/colors.ts";
  import { exists } from "https://deno.land/std@0.51.0/fs/mod.ts";
  ```

## Usage as a CLI

To use depsbot as a CLI you can install it with:

```bash
$ yarn global add depsbot
```

you can also use it for a one time run with npx.

## Maintainers

- Filippo Rossi ([@qu4k](https://github.com/qu4k))

## Other

### Related

- [dependabot](https://github.com/dependabot/dependabot-core) - Automated dependency updates built into GitHub

### Contribution

Pull request, issues and feedback are very welcome. Code style is formatted with `yarn format` and commit messages are done following Conventional Commits spec.

### Licence

Copyright 2020-present, the denosaurs team. All rights reserved. MIT license.
