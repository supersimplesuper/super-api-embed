import { EventEmitter } from "eventemitter3";
import log from "loglevel";

// What origins are we allowed to receive messages from
const allowedOrigins = [
  "https://api.superapi.com.au",
  "https://v2.superapi.com.au",
];

// Controls the kind of options that we're allowed to pass into the embed to
// configure it.
export type Options = {
  element: HTMLElement;
  loaderClass?: string;
  url: string;
};

export enum MESSAGE_KIND {
  EMPLOYER_SETTINGS_COMMITTED = "employerSettingsCommitted",
  ONBOARDING_SESSION_COMPLETE_COMMITTED = "onboardingSessionCompleteCommitted",
  TOAST = "toast",
  WINDOW_DIMENSION_CHANGE = "windowDimensionChange",
}

export type employerSettingsCommittedPayloadV1 = {
  kind: MESSAGE_KIND.EMPLOYER_SETTINGS_COMMITTED;
  version: "v1";
  data: Record<string, never>;
};

export type onboardingSessionCompleteCommittedPayloadV1 = {
  kind: MESSAGE_KIND.ONBOARDING_SESSION_COMPLETE_COMMITTED;
  version: "v1";
  data: Record<string, never>;
};

export type ToastMessagePayloadV1 = {
  kind: MESSAGE_KIND.TOAST;
  version: "v1";
  data: {
    kind: "success" | "error" | "info" | "warning";
    message: string;
  };
};

export type windowDimensionChangePayloadV1 = {
  kind: MESSAGE_KIND.WINDOW_DIMENSION_CHANGE;
  version: "v1";
  data: {
    bounds: DOMRect;
  };
};

export type AvailablePayloads =
  | ToastMessagePayloadV1
  | windowDimensionChangePayloadV1
  | employerSettingsCommittedPayloadV1
  | onboardingSessionCompleteCommittedPayloadV1;

export class Embed {
  // The constructed iFrame element that will show the `url`
  iframe: HTMLIFrameElement;

  // Shown before the iFrame has been loaded
  loader: HTMLDivElement;

  // Message listener for messages emitted via the iFrame using the
  // `postMessage` functionality
  handleMessageBound: (event: MessageEvent) => void;

  // Holds the configured options for the embed
  options: Options;

  // Holds the subscriber system for events related to the iFrame
  bus: EventEmitter;

  constructor(options: Options) {
    this.options = options;

    log.info(`Creating embed wrapper on element with URL: ${this.options.url}`);

    // Setup the event bus so others may subscribe the events
    this.bus = new EventEmitter();

    // Bind the scope of this function to the class but also assign it to a
    // variable so it can be unbound again when we teardown the class.
    this.handleMessageBound = this.handleMessage.bind(this);
    window.addEventListener("message", this.handleMessageBound);

    // Setup the iframe
    this.iframe = window.document.createElement("iframe");
    this.iframe.setAttribute("data-testid", "iframe");
    this.iframe.src = this.options.url;
    this.iframe.width = "100%";
    this.iframe.height = "0";
    this.iframe.setAttribute("data-testid", "iframe");
    this.iframe.addEventListener("load", () => {
      this.loader.remove();
    });

    // Setup the loader element, this is displayed before the iFrame is ready
    this.loader = window.document.createElement("div");
    this.loader.setAttribute("data-testid", "loader");
    this.loader.innerHTML = "Loading...";

    if (this.options.loaderClass) {
      this.loader.classList.add(this.options.loaderClass);
    }

    // Finally, append both elements, the loader will automatically be removed
    // when the iFrame has finished loading
    this.options.element.appendChild(this.loader);
    this.options.element.appendChild(this.iframe);
  }

  public teardown() {
    log.info(`Removing embed wrapper for: ${this.options.url}`);
    window.removeEventListener("message", this.handleMessageBound);
    this.options.element.innerHTML = "";
    this.bus.removeAllListeners();
  }

  public on(event: MESSAGE_KIND, cb: (data: AvailablePayloads) => void) {
    return this.bus.on(event, cb);
  }

  public off(event: MESSAGE_KIND, cb: (data: AvailablePayloads) => void) {
    return this.bus.off(event, cb);
  }

  public once(event: MESSAGE_KIND, cb: (data: AvailablePayloads) => void) {
    return this.bus.once(event, cb);
  }

  private handleMessage(event: MessageEvent<AvailablePayloads>) {
    if (allowedOrigins.includes(event.origin) !== true) {
      log.warn(
        `Message heard from unknown origin and will be ignored, was: ${event.origin}`,
      );
      return;
    }

    log.info(
      `Heard incoming message: ${event.data.kind}, with data: ${JSON.stringify(event.data.data)}`,
    );

    // Here we react to any messages that need to be handled from within the
    // embed code.
    switch (event.data.kind) {
      case MESSAGE_KIND.EMPLOYER_SETTINGS_COMMITTED: {
        this.bus.emit(event.data.kind, event.data.data);
        break;
      }

      case MESSAGE_KIND.ONBOARDING_SESSION_COMPLETE_COMMITTED: {
        this.bus.emit(event.data.kind, event.data.data);
        break;
      }

      case MESSAGE_KIND.TOAST: {
        this.bus.emit(event.data.kind, event.data.data);
        break;
      }

      case MESSAGE_KIND.WINDOW_DIMENSION_CHANGE: {
        this.bus.emit(event.data.kind, event.data.data);
        break;
      }

      default: {
        log.warn(
          `Received an unknown kind of message, was: ${JSON.stringify(event.data)}`,
        );
      }
    }
  }
}
