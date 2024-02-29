import "@testing-library/jest-dom";

import { fireEvent, within } from "@testing-library/dom";
import { EventEmitter } from "eventemitter3";
import loglevel from "loglevel";

import { Embed, MESSAGE_KIND } from "./index";

let element: HTMLDivElement;
let embed: Embed;

describe("Embed", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    element = window.document.createElement("div");

    embed = new Embed({
      element,
      url: "https://www.example.com/",
      loaderClass: "theClass",
    });
  });

  describe("instantiation", () => {
    it("logs the URL the embed is being created on", () => {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(loglevel.info).toHaveBeenCalledWith(
        `Creating embed wrapper on element with URL: https://www.example.com/`,
      );
    });

    it("contains a loading indicator", () => {
      const scope = within(element);
      const loader = scope.getByTestId("loader");
      expect(element).toContainElement(loader);
    });

    it("shows that the element is loading", () => {
      const scope = within(element);
      const loader = scope.getByTestId("loader");
      expect(loader).toHaveTextContent("Loading...");
    });

    it("applies a class to the loader element", () => {
      const scope = within(element);
      const loader = scope.getByTestId("loader");
      expect(loader).toHaveClass("theClass");
    });

    it("creates an iFrame element when instantiated", () => {
      const scope = within(element);
      const iframe = scope.getByTestId("iframe");
      expect(element).toContainElement(iframe);
    });

    it("sets defaults dimensions on the iframe", () => {
      const scope = within(element);
      const iframe = scope.getByTestId("iframe");
      expect(iframe).toHaveAttribute("height", "0");
      expect(iframe).toHaveAttribute("width", "100%");
    });

    it("when the iframe has loaded, it removes the loader element", () => {
      const scope = within(element);
      const iframe = scope.getByTestId("iframe");
      const loader = scope.getByTestId("loader");
      fireEvent(iframe, new Event("load"));
      expect(element).not.toContainElement(loader);
    });

    it("when the iframe has loaded, it removes the loader element", () => {
      const scope = within(element);
      const iframe = scope.getByTestId("iframe");
      fireEvent(iframe, new Event("load"));
      expect(iframe).toHaveAttribute("height", "100%");
    });
  });

  describe("teardown", () => {
    beforeEach(() => {
      embed.teardown();
    });

    it("logs that the embed is being removed", () => {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(loglevel.info).toHaveBeenCalledWith(
        `Removing embed wrapper for: https://www.example.com/`,
      );
    });

    it("removes everything under the element", () => {
      expect(element).toBeEmptyDOMElement();
    });
  });

  describe("event listeners", () => {
    it("can subscribe an event listener", () => {
      const on = embed.on(MESSAGE_KIND.TOAST, jest.fn());
      expect(on).toBeInstanceOf(EventEmitter);
    });
  });

  describe("handle messages", () => {
    it("warns when allowed origin does not match", () => {
      fireEvent(
        window,
        new MessageEvent("message", {
          origin: "https://www.badactor.com",
        }),
      );

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(loglevel.warn).toHaveBeenCalledWith(
        "Message heard from unknown origin and will be ignored, was: https://www.badactor.com",
      );
    });

    it("logs incoming messages", () => {
      fireEvent(
        window,
        new MessageEvent("message", {
          data: {
            hello: "world",
          },
          origin: "https://api.superapi.com.au",
        }),
      );

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(loglevel.info).toHaveBeenCalledWith(
        "Heard incoming message: undefined, with data: undefined",
      );
    });

    it("warns on unknown messages", () => {
      fireEvent(
        window,
        new MessageEvent("message", {
          data: {
            hello: "world",
          },
          origin: "https://api.superapi.com.au",
        }),
      );

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(loglevel.warn).toHaveBeenCalledWith(
        'Received an unknown kind of message, was: {"hello":"world"}',
      );
    });

    describe("employer settings committed", () => {
      it("calls externally bound listener", () => {
        const listener = jest.fn();

        const data = {
          kind: MESSAGE_KIND.EMPLOYER_SETTINGS_COMMITTED,
          data: {},
        };

        embed.on(MESSAGE_KIND.EMPLOYER_SETTINGS_COMMITTED, listener);

        fireEvent(
          window,
          new MessageEvent("message", {
            data,
            origin: "https://api.superapi.com.au",
          }),
        );

        expect(listener).toHaveBeenCalledWith(data.data);
      });
    });

    describe("onboarding session complete committed", () => {
      it("calls externally bound listener", () => {
        const listener = jest.fn();

        const data = {
          kind: MESSAGE_KIND.ONBOARDING_SESSION_COMPLETE_COMMITTED,
          data: {},
        };

        embed.on(MESSAGE_KIND.ONBOARDING_SESSION_COMPLETE_COMMITTED, listener);

        fireEvent(
          window,
          new MessageEvent("message", {
            data,
            origin: "https://api.superapi.com.au",
          }),
        );

        expect(listener).toHaveBeenCalledWith(data.data);
      });
    });

    describe("toast", () => {
      it("calls externally bound listener", () => {
        const listener = jest.fn();

        const data = {
          kind: MESSAGE_KIND.TOAST,
          data: {
            kind: "success",
            message: "Hello world",
          },
        };

        embed.on(MESSAGE_KIND.TOAST, listener);

        fireEvent(
          window,
          new MessageEvent("message", {
            data,
            origin: "https://api.superapi.com.au",
          }),
        );

        expect(listener).toHaveBeenCalledWith(data.data);
      });
    });

    describe("window dimensions change event", () => {
      it("calls externally bound listener", () => {
        const listener = jest.fn();

        const data = {
          kind: MESSAGE_KIND.WINDOW_DIMENSION_CHANGE,
          data: {
            bounds: {
              height: 200,
            },
          },
        };

        embed.on(MESSAGE_KIND.WINDOW_DIMENSION_CHANGE, listener);

        fireEvent(
          window,
          new MessageEvent("message", {
            data,
            origin: "https://api.superapi.com.au",
          }),
        );

        expect(listener).toHaveBeenCalledWith(data.data);
      });
    });
  });
});
