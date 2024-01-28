import { consola } from "consola";
import * as EventEmitter from "eventemitter3";

const allowedOrigins = [
  "https://v2.superapi.com.au",
  "https://api.superapi.com.au",
];

type Options = {
  element: HTMLElement;
  url: string;
  loaderClass?: string;
};

export class Embed {
  // The constructed iFrame element that will show the `url`
  iframe: HTMLIFrameElement;

  // Shown before the iFrame has been loaded
  loader: HTMLDivElement;

  // Message listener for messsages emitted via the iFrame using the
  // `postMessage` functionality
  handleMessageBound: (event: MessageEvent) => void;

  // Holds the configured options for the embed
  options: Options;

  // Holds the subscriber system for events related to the iFrame
  bus: EventEmitter;

  constructor(options: Options) {
    this.options = {
      ...options,
    };

    consola.info(
      `Creating embed wrapper on element: ${this.options.element} with URL: ${this.options.url}`,
    );

    // Setup the event bus so others may subscribe the events
    this.bus = new EventEmitter();

    // Bind the scope of this function to the class but also assign it to a
    // variable so it can be unbound again when we teardown the class.
    this.handleMessageBound = this.handleMessage.bind(this);
    window.addEventListener("message", this.handleMessageBound);

    // Setup the iframe
    this.iframe = document.createElement("iframe");
    this.iframe.src = this.options.url;
    this.iframe.width = "100%";
    this.iframe.height = "0";
    this.iframe.addEventListener("load", () => {
      this.loader.remove();
    });

    // Setup the loader element, this is displayed before the iFrame is ready
    this.loader = document.createElement("div");
    this.loader.innerHTML = "Loading settings...";

    if (this.options.loaderClass) {
      this.loader.classList.add(this.options.loaderClass);
    }

    // Finally, append both elements, the loader will automatically be removed
    // when the iFrame has finishd loading
    this.options.element.appendChild(this.loader);
    this.options.element.appendChild(this.iframe);
  }

  teardown() {
    consola.info(`Removing embed wrapper for: ${this.options.url}`);
    window.removeEventListener("message", this.handleMessageBound);
    this.options.element.innerHTML = "";
    this.bus.removeAllListeners();
  }

  on(event: string, cb: (data: any) => void) {
    this.bus.on(event, cb);
  }

  off(event: string, cb: (data: any) => void) {
    this.bus.off(event, cb);
  }

  once(event: string, cb: (data: any) => void) {
    this.bus.once(event, cb);
  }

  private handleMessage(event: MessageEvent) {
    if (allowedOrigins.includes(event.origin) !== true) {
      consola.warn(
        "Message heard from unknown origin, ignoring it",
        event.origin,
      );
      consola.debug(event);
      return;
    }

    consola.info(`Heard incoming message: ${event.data.kind}`, event.data.data);

    // Here we react to any messages that need to be handled from within the
    // embed code.
    switch (event.data.kind) {
      // When the dimensions of the iFrames height change, we want to modify
      // the containing element
      case "windowDimensionChange":
        const height = event.data.data.bounds.height;
        consola.debug(
          `Reacting to dimensions change of iFrame element, setting height to ${height}`,
        );
        this.iframe.height = `${height}px`;
    }

    // Emit the event onto the bus so that any third party subscribers can listen to it
    this.bus.emit(event.data.kind, event.data.data);
  }
}
