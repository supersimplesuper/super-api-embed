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

| Name                | Description                                                                                                                                   | Required | Example                              |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------ |
| element             | The DOM node you want to place the embed into. Any content in this node will be removed                                                       | Yes      | `document.getElementById("myEmbed")` |
| extraAllowedOrigins | By default the embed will only accept messages from origin https://api.superapi.com.au - if required, you can pass extra allowed origins here | No       | `['https://www.example.com']`        |
| loaderClass         | An optional class that can be added to the loader element which is shown when the embed is initializing. Use this to customise the loader.    | No       | `.myLoader`                          |
| url                 | The SuperAPI URL that has been signed, this will then be loaded                                                                               | Yes      | `https://example.com`                |

Once the loader has been setup you can then interact with returned instance of the embed.

#### Embed height

The embed will automatically expand the iFrame to match the contents of what it is showing. If your layout has a fixed height, please place the iFrame in a container element with a style of `overflow-y: auto` to avoid the embed breaking your page layout.

#### Customising the loader

You can choose to use our loader element (and optionally target it by passing the `loaderClass` configuration option) or if you want to have complete control, pass a custom `loaderClass` set to `display: none` and use the load event to hide your own loading indicator when the embed has
finished loading.

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

Subscribe using: `MESSAGE_KIND.TOAST`

Fired when a notification message should be shown to the user, i.e. when they have selected a fund.

The data component of this event contains:

| Name    | Description                                                                   |
| ------- | ----------------------------------------------------------------------------- |
| kind    | The level of the toast, one of either "success", "error", "info" or "warning" |
| message | The content of the message, i.e. "Thank you for your selection"               |

#### Window dimension change

Subscribe using: `MESSAGE_KIND.WINDOW_DIMENSION_CHANGE`

Fired when the DOM contents of the embed has changed and caused the height of the embed to change.

| Name   | Description                                                      |
| ------ | ---------------------------------------------------------------- |
| bounds | A `DOMRect` instance which contains the dimensions of the widget |

#### Loaded

Subscribe using: `MESSAGE_KIND.LOADED`

Fired when the embed has finished loading.

No data is passed with this event.

#### Employer settings updated

Subscribe using: `MESSAGE_KIND.EMPLOYER_SETTINGS_UPDATED`

Fired when an update has been made to the employer settings but the data changes have not been delivered to the partner system. Only fires for URLs which load the employer settings embed.

No data is passed with this event.

#### Employer settings committed

Subscribe using: `MESSAGE_KIND.EMPLOYER_SETTINGS_COMMITTED`

Fired when a change to the employer settings has been committed into the partners system. This fires when the webhook delivering the data into the partner has responded with a < 400 status code. Only fires for URLs which load the employer settings embed.

This can be used in combination with the employer settings updated to create a busy state which can show the update to the employer details being in flight.

No data is passed with this event.

#### Onboarding session committed

Subscribe using: `MESSAGE_KIND.ONBOARDING_SESSION_COMMITTED`

Fired when a user has completed the onboarding flow and the information has been delivered into the partner system (the same "committed" rules as the employer settings apply here)

No data is passed with this event.

#### Onboarding session finished

Subscribe using: `MESSAGE_KIND.ONBOARDING_SESSION_FINISHED`

Fired when a user has finished the onboarding flow but we have not transmitted the payload of data. As some provisioning of member details is asynchronous you will most likely be listening to this event to move the user to the next step of the onboarding.

No data is passed with this event.

#### Onboarding step changed

Subscribe using: `MESSAGE_KIND.ONBOARDING_STEP_CHANGED`

Fired when the following events occur:

1. The embed has loaded. `current_step` will be the step that the user is currently on.
2. The user has moved to the next step in the onboarding flow. In this case, `current_step` will reflect this next step.

The data component of this event contains:

| Name           | Description                                   |
| -------------- | --------------------------------------------- |
| `current_step` | The current step of the onboarding flow       |
| `steps`        | All steps associated with the onboarding flow |

This event should be listened to when you want to update your UI to reflect the current step that the user is on.

> Please do not use this event to update your systems (i.e. make API requests as a side-effect from this event). Utilise our webhooks instead.

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
  employerSettingsEmbed.on(MESSAGE_KIND.TOAST, (data: any) => {
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
<head>
    <title>SuperAPI Library</title>
</head>
<body>
    <h1>Working</h1>
    <div id="embed"></div>
    <script type="module">
        import { Embed, MESSAGE_KIND } from 'https://cdn.jsdelivr.net/npm/@super-api/super-api-embed@4.2.0/+esm';
        document.addEventListener('DOMContentLoaded', () => {
            const target = document.querySelector("#embed");
            const embedInstance = new Embed({
              element: target,
              url: 'http://www.example.com/'
            })

            console.log('Embed instance created:)
            console.log(embedInstance);
        })
    </script>
</body>
</html>
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
