import { EventEmitter } from "eventemitter3";
import log from "loglevel";

import { MESSAGE_KIND } from "./services/messages";
import {
  Data as EmployerSettingsCommittedDataV1,
  Message as EmployerSettingsCommittedMessageV1,
} from "./services/messages/v1/employer_settings_committed";
import {
  Data as EmployerSettingsUpdatedDataV1,
  Message as EmployerSettingsUpdatedMessageV1,
} from "./services/messages/v1/employer_settings_updated";
import {
  Data as LoadedMessageDataV1,
  Message as LoadedMessageV1,
} from "./services/messages/v1/loaded";
import {
  Data as OnboardingSessionCommittedDataV1,
  Message as OnboardingSessionCommittedMessageV1,
} from "./services/messages/v1/onboarding_session_committed";
import {
  Data as OnboardingSessionFinishedDataV1,
  Message as OnboardingSessionFinishedMessageV1,
} from "./services/messages/v1/onboarding_session_finished";
import {
  Data as OnboardingStepChangedDataV1,
  Message as OnboardingStepChangedMessageV1,
} from "./services/messages/v1/onboarding_step_changed";
import {
  Data as ToastMessageDataV1,
  Kind as ToastKindV1,
  Message as ToastMessageV1,
} from "./services/messages/v1/toast";
import {
  Data as WindowDimensionChangeMessageDataV1,
  Message as WindowDimensionChangeMessageV1,
} from "./services/messages/v1/window_dimension_change";

export { MESSAGE_KIND };
export { EmployerSettingsCommittedDataV1, EmployerSettingsCommittedMessageV1 };
export { EmployerSettingsUpdatedDataV1, EmployerSettingsUpdatedMessageV1 };
export {
  OnboardingSessionCommittedDataV1,
  OnboardingSessionCommittedMessageV1,
};
export { OnboardingSessionFinishedDataV1, OnboardingSessionFinishedMessageV1 };
export { OnboardingStepChangedDataV1, OnboardingStepChangedMessageV1 };
export { ToastKindV1, ToastMessageDataV1, ToastMessageV1 };
export { LoadedMessageDataV1, LoadedMessageV1 };
export { WindowDimensionChangeMessageDataV1, WindowDimensionChangeMessageV1 };

export type AvailableMessages =
  | EmployerSettingsCommittedMessageV1
  | EmployerSettingsUpdatedMessageV1
  | LoadedMessageV1
  | OnboardingSessionCommittedMessageV1
  | OnboardingSessionFinishedMessageV1
  | OnboardingStepChangedMessageV1
  | ToastMessageV1
  | WindowDimensionChangeMessageV1;

export type MessageKindToTypeMap = {
  [MESSAGE_KIND.EMPLOYER_SETTINGS_COMMITTED]: EmployerSettingsCommittedMessageV1;
  [MESSAGE_KIND.EMPLOYER_SETTINGS_UPDATED]: EmployerSettingsUpdatedMessageV1;
  [MESSAGE_KIND.LOADED]: LoadedMessageV1;
  [MESSAGE_KIND.ONBOARDING_SESSION_COMMITTED]: OnboardingSessionCommittedMessageV1;
  [MESSAGE_KIND.ONBOARDING_SESSION_FINISHED]: OnboardingSessionFinishedMessageV1;
  [MESSAGE_KIND.ONBOARDING_STEP_CHANGED]: OnboardingStepChangedMessageV1;
  [MESSAGE_KIND.TOAST]: ToastMessageV1;
  [MESSAGE_KIND.WINDOW_DIMENSION_CHANGE]: WindowDimensionChangeMessageV1;
};

// What origins are we allowed to receive messages from
const defaultAllowedOrigins = ["https://api.superapi.com.au"];

// Controls the kind of options that we're allowed to pass into the embed to
// configure it.
export type Options = {
  element: HTMLElement;
  extraAllowedOrigins?: Array<string>;
  loaderClass?: string;
  url: string;
};

export class Embed {
  // The constructed iFrame element that will show the `url`
  iframe: HTMLIFrameElement;

  // Shown before the iFrame has been loaded
  loader: HTMLDivElement | null;

  // Message listener for messages emitted via the iFrame using the
  // `postMessage` functionality
  handleMessageBound: (event: MessageEvent) => void;

  // Holds the configured options for the embed
  options: Options;

  // Holds the subscriber system for events related to the iFrame
  bus: EventEmitter;

  // What origins will we listen to messages from?
  allowedOrigins: Array<string>;

  constructor(options: Options) {
    this.options = options;

    log.info(`Creating embed wrapper on element with URL: ${this.options.url}`);

    // Setup the allowed origins that we listen to messages from
    this.allowedOrigins = defaultAllowedOrigins.concat(
      this.options.extraAllowedOrigins ? this.options.extraAllowedOrigins : [],
    );

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

  public on<K extends MESSAGE_KIND>(
    event: K,
    cb: (data: MessageKindToTypeMap[K]) => void,
  ) {
    return this.bus.on(event, cb);
  }

  public off<K extends MESSAGE_KIND>(
    event: K,
    cb: (data: MessageKindToTypeMap[K]) => void,
  ) {
    return this.bus.off(event, cb);
  }

  public once<K extends MESSAGE_KIND>(
    event: K,
    cb: (data: MessageKindToTypeMap[K]) => void,
  ) {
    return this.bus.once(event, cb);
  }

  private handleMessage(event: MessageEvent<AvailableMessages>) {
    if (this.allowedOrigins.includes(event.origin) !== true) {
      log.warn(
        `Message heard from unknown origin and will be ignored, was: ${event.origin}`,
      );
      return;
    }

    log.info(
      `Heard incoming message: ${event.data.kind}, with data: ${JSON.stringify(event.data.data)}`,
    );

    // Here we react to any messages that need to be handled from within the
    // embed code (currently we don't do anything in particular based on an
    // incoming message before we hand it over)
    switch (event.data.kind) {
      case MESSAGE_KIND.EMPLOYER_SETTINGS_COMMITTED: {
        this.bus.emit(event.data.kind, event.data.data);
        break;
      }

      case MESSAGE_KIND.EMPLOYER_SETTINGS_UPDATED: {
        this.bus.emit(event.data.kind, event.data.data);
        break;
      }

      case MESSAGE_KIND.LOADED: {
        this.bus.emit(event.data.kind, event.data.data);

        if (this.loader !== null) {
          this.loader.remove();
          this.loader = null;
        }

        break;
      }

      case MESSAGE_KIND.ONBOARDING_SESSION_COMMITTED: {
        this.bus.emit(event.data.kind, event.data.data);
        break;
      }

      case MESSAGE_KIND.ONBOARDING_SESSION_FINISHED: {
        this.bus.emit(event.data.kind, event.data.data);
        break;
      }

      case MESSAGE_KIND.ONBOARDING_STEP_CHANGED: {
        this.bus.emit(event.data.kind, event.data.data);
        break;
      }

      case MESSAGE_KIND.TOAST: {
        this.bus.emit(event.data.kind, event.data.data);
        break;
      }

      case MESSAGE_KIND.WINDOW_DIMENSION_CHANGE: {
        const height = event.data.data.bounds.height;

        log.debug(
          `Reacting to dimensions change of iFrame element, setting height to ${height}`,
        );

        this.iframe.height = `${height}px`;

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
