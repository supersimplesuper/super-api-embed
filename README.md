# SuperAPI Embed

![NPM Version](https://img.shields.io/npm/v/@super-api/super-api-embed)
![License](https://img.shields.io/npm/l/@super-api/super-api-embed)
![Types](https://img.shields.io/npm/types/@super-api/super-api-embed)
![Weekly Downloads](https://img.shields.io/npm/dw/@super-api/super-api-embed)
![Bundle Size](https://img.shields.io/bundlephobia/minzip/@super-api/super-api-embed)
![GitHub Workflow Status](https://github.com/supersimplesuper/super-api-embed/actions/workflows/super-api-embed.yml/badge.svg?branch=main)

This is a JavaScript wrapper around the SuperAPI UI embed. It is designed to make interacting with the embed in the frontend easier.

## Contents

- [Usage](#usage)
  - [Installation](#installation)
  - [Creating an embed](#creating-an-embed)
  - [Events](#events)
  - [Instance methods](#instance-methods)
- [Use with React](#use-with-react)
- [Use without a JavaScript compiler](#use-without-a-javascript-compiler)
- [FAQ](#faq)
- [Contributing](#contributing)

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

| Name                | Description                                                                                                                                   | Required | Example                                    |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------ |
| element             | The DOM node you want to place the embed into. Any content in this node will be removed                                                       | Yes      | `document.getElementById("myEmbed")`       |
| extraAllowedOrigins | By default the embed will only accept messages from origin https://api.superapi.com.au - if required, you can pass extra allowed origins here | No       | `['https://www.example.com']`              |
| loaderClass         | An optional class that can be added to the loader element which is shown when the embed is initializing. Use this to customise the loader.    | No       | `.myLoader`                                |
| onLoadError         | An optional callback that will fire if the embed cannot load SuperAPI due to an error                                                         | No       | `() => { console.log('Error detected!') }` |
| url                 | The SuperAPI URL that has been signed, this will then be loaded                                                                               | Yes      | `https://example.com`                      |
| createLoader        | A function that creates the element which is shown when loading the iFrame                                                                    | No       | `() => document.createElement("div");`     |

Once the loader has been setup you can then interact with returned instance of the embed.

#### Embed height

The embed will automatically expand the iFrame to match the contents of what it is showing. If your host page has a fixed height, see the [FAQ](#faq) for how to keep the embed from breaking your layout.

#### Customising the loader

You can choose to use our loader element (and optionally target it by passing the `loaderClass` configuration option) or if you want to have complete control, pass a custom `loaderClass` set to `display: none` and use the load event to hide your own loading indicator when the embed has
finished loading.

#### Handling load errors

In the rare case that the embed fails to load SuperAPI content we provide a callback, `onLoadError`, which will fire shortly after the content fails to load. This will handle scenarios where expired onboarding sessions are loaded, incorrect signing is applied to the embed URL or a network failure means the embed cannot be loaded or initialised.

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
  ToastMessageDataV1,
} from "@super-api/super-api-embed";

// Listen for toast messages from SuperAPI and alert the user
embed.on(MESSAGE_KIND.TOAST, (data: ToastMessageDataV1) => {
  if (data.kind === "warning") {
    alert(data.message);
  }
});
```

The full list of events is below. Events marked _none_ in the **Data** column are fired without a payload; events with a linked payload have their data shape documented further down.

| Event                         | Constant                                  | Data                                                | When it fires                                                                                                                                                            |
| ----------------------------- | ----------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Toast message                 | `MESSAGE_KIND.TOAST`                      | [See payload](#toast-payload)                       | A notification should be shown to the user, e.g. when they have selected a fund.                                                                                         |
| Window dimension change       | `MESSAGE_KIND.WINDOW_DIMENSION_CHANGE`    | [See payload](#window-dimension-change-payload)     | The DOM contents of the embed have changed and caused the height of the embed to change.                                                                                 |
| Loaded                        | `MESSAGE_KIND.LOADED`                     | _none_                                              | The embed has finished loading.                                                                                                                                          |
| Employer settings updated¹    | `MESSAGE_KIND.EMPLOYER_SETTINGS_UPDATED`  | _none_                                              | An update has been made to the employer settings but the change has not yet been delivered to the partner system.                                                        |
| Employer settings committed¹  | `MESSAGE_KIND.EMPLOYER_SETTINGS_COMMITTED`| _none_                                              | A change to the employer settings has been committed into the partner system (the partner webhook responded with a `<400` status code).                                  |
| Onboarding intent completed   | `MESSAGE_KIND.ONBOARDING_INTENT_COMPLETED`| _none_                                              | A user has completed their onboarding session intent. Useful for showing a "processing" state while waiting for the webhook to complete.                                 |
| Onboarding session committed  | `MESSAGE_KIND.ONBOARDING_SESSION_COMMITTED`| _none_                                             | A user has completed the onboarding flow and the data has been delivered into the partner system (the same "committed" rules as employer settings apply here).           |
| Onboarding session finished   | `MESSAGE_KIND.ONBOARDING_SESSION_FINISHED`| _none_                                              | A user has finished the onboarding flow but the payload has not yet been transmitted. Use this to move the user to the next step without waiting on async provisioning.  |
| Onboarding step changed       | `MESSAGE_KIND.ONBOARDING_STEP_CHANGED`    | [See payload](#onboarding-step-changed-payload)     | The embed has loaded, or the user has moved to the next step in the onboarding flow.                                                                                     |
| MFA verification completed    | `MESSAGE_KIND.MFA_VERIFICATION_COMPLETED` | [See payload](#mfa-verification-completed-payload)  | The user has finished their MFA session, either by verifying successfully or by exhausting the maximum number of verification attempts.                                  |
| Page loaded                   | `MESSAGE_KIND.PAGE_LOADED`                | _none_                                              | A new page is loaded inside the embed. The embed will also scroll the iFrame to the top of the viewport so the new page is visible.                                      |

¹ Only fires for URLs which load the employer settings embed. The updated/committed pair can be used together to drive a busy/in-flight state in your UI.

#### Toast payload

| Name    | Description                                                                   |
| ------- | ----------------------------------------------------------------------------- |
| kind    | The level of the toast, one of either "success", "error", "info" or "warning" |
| message | The content of the message, i.e. "Thank you for your selection"               |

#### Window dimension change payload

| Name   | Description                                                      |
| ------ | ---------------------------------------------------------------- |
| bounds | A `DOMRect` instance which contains the dimensions of the widget |

#### Onboarding step changed payload

| Name           | Description                                   |
| -------------- | --------------------------------------------- |
| `current_step` | The current step of the onboarding flow       |
| `steps`        | All steps associated with the onboarding flow |

Listen to this event when you want to update your UI to reflect the current step that the user is on. The event fires twice in the lifecycle worth being aware of: once when the embed first loads (with `current_step` set to wherever the user is resuming from), and again each time they advance to the next step.

> Please do not use this event to update your systems (i.e. make API requests as a side-effect from this event). Utilise our webhooks instead.

If a sticky header on your host page is hiding the top of the iFrame after a `PAGE_LOADED` scroll, see the [FAQ](#faq).

#### MFA verification completed payload

| Name          | Description                                                                                                                                  |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `verified_at` | An ISO 8601 timestamp indicating when the MFA session was verified. Will be `null` when the maximum number of verification attempts has been exceeded, allowing you to distinguish a successful verification from an exhausted one. |

### Instance methods

The object returned from `new Embed({ ... })` exposes the following methods. Event callbacks receive the event's payload (the inner `data`), not the full message envelope; the payload shape for each event is described in the [Events](#events) section.

#### `embed.on(event, callback)`

Subscribes `callback` to fire every time `event` is emitted. Returns the underlying event emitter so calls can be chained.

```typescript
embed.on(MESSAGE_KIND.LOADED, () => {
  console.log("embed ready");
});
```

#### `embed.once(event, callback)`

Same as `on`, but the callback only fires on the first emission and is then automatically removed.

#### `embed.off(event, callback)`

Removes a previously registered callback for `event`. The same function reference passed to `on` must be passed here for removal to succeed.

#### `embed.teardown()`

Removes all registered event listeners, clears the embed's container element, and detaches the underlying `window` `message` handler. Call this when the embed is being unmounted (e.g. in a React effect cleanup) so the embed does not continue receiving messages or leaking listeners.

## Use with React

While the SuperAPI JS library is not specifically designed to be used with React it is easy to integrate with some use of `useEffect` and a `ref` on a dom node.

```typescript
// Create a ref that will be used to contain the embed
const embedRef = React.useRef<null | HTMLDivElement>(null);

// And a state which is used to hold the instance of the embed
const [embed, setEmbed] = React.useState<null | Embed>(null);

React.useEffect(() => {
  // Ensure that we have a dom node to target with the embed and that the
  // embed is not already loaded
  if (embedRef.current === null || embed !== null) {
    return;
  }

  // Create the embed with the reference to the dom node and the URL
  const employerSettingsEmbed = new Embed({
    element: embedRef.current,
    url: embedUrl,
  });

  // Handle toast message being broadcast and show them using our custom toast
  // message displayer (this ensures that toast messages look native to our
  // application)
  employerSettingsEmbed.on(MESSAGE_KIND.TOAST, (data: ToastMessageDataV1) => {
    if (data.kind === "info") {
      toast(data.message);
    }

    if (data.kind === "success") {
      toast.success(data.message);
    }
  });

  // Listener for when the employer settings have been committed back to our
  // application. The `onSelection` callback will display a "continue" button
  // to the user once they have set their default fund.
  employerSettingsEmbed.on(MESSAGE_KIND.EMPLOYER_SETTINGS_COMMITTED, () => {
    if (onSelection) {
      onSelection();
    }
  });

  // Finally, store a reference to the embed. This allows us to call methods on
  // it from elsewhere in our component if we require.
  setEmbed(employerSettingsEmbed);

  // When the component is unloaded, call the teardown function which will
  // automatically remove the event listeners we bound in the code above
  return () => {
    if (embed !== null) {
      (embed as Embed).teardown();
    }
  };
}, [embed, onSelection, embedUrl]);
```

## Use without a JavaScript compiler

It's also possible to use this library without the use of a bundler or compiler:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>SuperAPI Library</title>
  </head>
  <body>
    <h1>Working</h1>
    <div id="embed"></div>
    <script type="module">
      // Pin to a specific version for production. Omit the version to always resolve the latest release.
      import { Embed, MESSAGE_KIND } from 'https://cdn.jsdelivr.net/npm/@super-api/super-api-embed/+esm';
      document.addEventListener('DOMContentLoaded', () => {
          const target = document.querySelector("#embed");
          const embedInstance = new Embed({
            element: target,
            url: 'http://www.example.com/'
          })

          console.log('Embed instance created');
          console.log(embedInstance);
      })
    </script>
  </body>
</html>
```

## FAQ

### The embed is making my page scroll or breaking my fixed-height layout. How do I fix it?

The embed automatically expands its iFrame to match the height of the content it is showing. If your host page has a fixed height and you do not want the embed to push past that height, place the iFrame inside a container element with `overflow-y: auto`. The container will scroll instead of your whole page.

### After the embed navigates to a new page, the top is hidden behind my sticky header. How do I fix it?

When a new page loads inside the embed, the library scrolls the iFrame to the top of the viewport so the user sees the new content (this is the `PAGE_LOADED` event behaviour). If your host page has a fixed or sticky header that overlaps the embed, set `scroll-padding-top` on the `html` element to your header's height. The scroll will then leave room for your header.

## Contributing

### TypeScript

Commands:

- `build`: runs type checking, then ESM and `d.ts` files in the `build/` directory
- `clean`: removes the `build/` directory
- `type:dts`: only generates `d.ts`
- `type:check`: only runs type checking
- `type:build`: only generates ESM

### Tests

Tests run on [Node.js's native test runner](https://nodejs.org/api/test.html). Coverage is collected via [c8](https://github.com/bcoe/c8); this will switch to Node.js's own coverage tooling once it is out of experimental.

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
