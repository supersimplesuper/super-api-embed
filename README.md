# SuperAPI Embed

![NPM](https://img.shields.io/npm/v/@super-api/super-api-embed)
![GitHub Workflow Status](https://github.com/supersimplesuper/super-api-embed/actions/workflows/super-api-embed.yml/badge.svg?branch=main)

This is a JavaScript wrapper around the SuperAPI UI embed. It is designed to make interacting with the embed in the frontend easier.

## Usage

### Installation

```bash
npm i @super-api/super-api-embed
```

### Creating an embed

To get started with the SuperAPI embed, simply invoke it passing a signed URL that has been generated from the SuperAPI backend (or has been self signed). For example:

```typescript
import { Embed, MESSAGE_KIND } from "@super-api/super-api-embed";

// The signed URL provided by SuperAPI
const url = "https://www.example.com/";

// The element that we will place the embed into
const element = window.document.getElementById("myEmbed");

// Create the embed and store a reference to it
const embed = new Embed({
  element,
  url,
});
```

The `Embed` class can be invoked with the following parameters:

| Name        | Description                                                                                                                                | Required |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| element     | The DOM node you want to place the embed into. Any content in this node will be removed                                                    | Yes      |
| url         | The SuperAPI URL that has been signed, this will then be loaded                                                                            | Yes      |
| loaderClass | An optional class that can be added to the loader element which is shown when the embed is initializing. Use this to customise the loader. |

Once the loader has been setup you can then interact with returned instance of the embed.

### Automatic resizing

The embed emits an event each time the DOM content has been modified, this event is then _debounced_ with a 300ms delay to avoid overwhelming any event listeners that might be bound to listen to it. The embed internally listens to this resize event and will automatically adjust the height of the iFrame element to try and match the content. If required, you can constraint the height of the iFrame with a `max-height` CSS property and the contents of the iFrame will automatically scroll to accommodate the content.

### Events

The embed emits a number of useful events that can be listened to. All events have the following data structure at the top level:

| Field   | Description                                                                  |
| ------- | ---------------------------------------------------------------------------- |
| kind    | What kind of event is being triggered                                        |
| version | The version of the event being emitted, currently only "V1"                  |
| data    | An object containing information specific to the event that has been emitted |

Here is an example of listening to the toast message being emitted from the embed.

```typescript
import {
  Embed,
  MESSAGE_KIND,
  ToastMessagePayloadV1,
} from "@super-api/super-api-embed";

// Listen for toast messages from SuperAPI and alert the user
embed.on(MESSAGE_KIND.TOAST, (event: ToastMessagePayloadV1) => {
  if (event.kind === "warning") {
    alert(event.data.message);
  }
});
```

#### Toast message

Fired when a notification message should be shown to the user, i.e. when they have selected a fund.

The data component of this event contains:

| Name | Description |
| kind | The level of the toast, one of either "success", "error", "info" or "warning" |
| message | The content of the message, i.e. "Thank you for your selection" |

#### Window dimension change

Fired when the DOM contents of the embed has changed. Not all DOM mutations will change the actual height but most will.

| Name | Description |
| bounds | A `DOMRect` instance which contains the dimensions of the widget |

#### Employer settings committed

Fired when a change to the employer settings has been committed into the partners system. This fires when the webhook delivering the data into the partner has responded with a < 400 status code. Only fires for URLs which load the employer settings embed.

#### Onboarding session complete committed

Fired when a user has completed the onboarding flow and the information has been delivered into the partner system (the same "committed" rules as the employer settings apply here)

## Use with React

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
