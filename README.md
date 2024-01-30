# SuperAPI Embed

![NPM](https://img.shields.io/npm/v/supersimplesuper/super-api-embed)
![GitHub Workflow Status](https://github.com/supersimplesuper/super-api-embed/actions/workflows/super-api-embed.yml/badge.svg?branch=main)

This is a JavaScript wrapper around the SuperAPI UI embed. It is designed to make interacting with the embed in the frontend easier.

## Usage

### Installation

```bash
npm install @superapi/super-api-embed
```

### Creating an embed

Using Typescript:

```typescript
import { Embed, MESSAGE_KIND } from "./index";

// The element that we will place the embed into
const element = window.document.getElementById("myEmbed");

// Create the embed and store a reference to it
const embed = new Embed({
  url: "https://www.example.com/",
});

// Listen for toast messages from SuperAPI and alert the user
embed.on(MESSAGE_KIND.TOAST, (data) => {
  if (data.kind === "warning") {
    alert(data.message);
  }
});
```

## Contributing

### ASDF

We use ASDF to mange the versions of tools required for development on this library. Install ASDF and the NodeJS plugin then run

```bash
asdf install
```

In the root directory to install the correct version of NodeJS.

### TypeScript

Commands:

- `build`: runs type checking, then ESM and `d.ts` files in the `build/` directory
- `clean`: removes the `build/` directory
- `type:dts`: only generates `d.ts`
- `type:check`: only runs type checking
- `type:build`: only generates ESM

### Tests

TypeScript Library Starter uses [Node.js's native test runner](https://nodejs.org/api/test.html). Coverage is done using [c8](https://github.com/bcoe/c8) but will switch to Node.js's one once out.

Commands:

- `test`: runs test runner
- `test:watch`: runs test runner in watch mode
- `test:coverage`: runs test runner and generates coverage reports

### Format & lint

Commands:

- `format`: runs Prettier with automatic fixing
- `format:check`: runs Prettier without automatic fixing (used in CI)
- `lint`: runs ESLint with automatic fixing
- `lint:check`: runs ESLint without automatic fixing (used in CI)
- `spell:check`: runs spell checking

### Releasing

Under the hood, this library uses [semantic-release](https://github.com/semantic-release/semantic-release) and [Commitizen](https://github.com/commitizen/cz-cli).
The goal is to avoid manual release processes. Using `semantic-release` will automatically create a GitHub release (hence tags) as well as an npm release.
Based on your commit history, `semantic-release` will automatically create a patch, feature, or breaking release.

Commands:

- `cz`: interactive CLI that helps you generate a proper git commit message, using [Commitizen](https://github.com/commitizen/cz-cli)
- `semantic-release`: triggers a release (used in CI)
