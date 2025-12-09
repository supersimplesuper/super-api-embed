import "@testing-library/jest-dom";

import { fireEvent, within } from "@testing-library/dom";
import { EventEmitter } from "eventemitter3";
import loglevel from "loglevel";

import { Embed, MESSAGE_KIND } from "./index";

let element: HTMLDivElement;
let embed: Embed;

describe("Embed", () => {
  describe("with default options", () => {
    beforeEach(() => {
      jest.clearAllMocks();

      element = window.document.createElement("div");

      embed = new Embed({
        element,
        loaderClass: "theClass",
        url: "https://www.example.com/",
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

      it("removes the loader element when the load event fires", () => {
        const scope = within(element);
        const loader = scope.getByTestId("loader");

        const data = {
          kind: MESSAGE_KIND.LOADED,
          data: null,
        };

        fireEvent(
          window,
          new MessageEvent("message", {
            data,
            origin: "https://api.superapi.com.au",
          }),
        );

        expect(element).not.toContainElement(loader);
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
            data: null,
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

      describe("employer settings updated", () => {
        it("calls externally bound listener", () => {
          const listener = jest.fn();

          const data = {
            kind: MESSAGE_KIND.EMPLOYER_SETTINGS_UPDATED,
            data: null,
          };

          embed.on(MESSAGE_KIND.EMPLOYER_SETTINGS_UPDATED, listener);

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

      describe("loaded", () => {
        it("calls externally bound listener", () => {
          const listener = jest.fn();

          const data = {
            kind: MESSAGE_KIND.LOADED,
            data: null,
          };

          embed.on(MESSAGE_KIND.LOADED, listener);

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
            kind: MESSAGE_KIND.ONBOARDING_SESSION_COMMITTED,
            data: null,
          };

          embed.on(MESSAGE_KIND.ONBOARDING_SESSION_COMMITTED, listener);

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

      describe("onboarding step changes", () => {
        it("calls externally bound listener", () => {
          const listener = jest.fn();

          const data = {
            kind: MESSAGE_KIND.ONBOARDING_STEP_CHANGED,
            data: {
              current_step: "collect_super_details",
              steps: [
                "verify_phone_number",
                "collect_employee_identity",
                "collect_employee_contact_details",
                "collect_employee_emergency_contact",
                "collect_bank_accounts",
                "collect_super_disclaimer",
                "collect_super_details",
              ],
            },
          };

          embed.on(MESSAGE_KIND.ONBOARDING_STEP_CHANGED, listener);

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

      describe("mfa verification complete event", () => {
        it("calls the bound listener", () => {
          const listener = jest.fn();

          const data = {
            kind: MESSAGE_KIND.MFA_VERIFICATION_COMPLETED,
            data: {
              verified_at: "2025-06-11T04:56:46.372459Z",
              remote_id: null,
            },
          };

          embed.on(MESSAGE_KIND.MFA_VERIFICATION_COMPLETED, listener);

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
        it("logs the event", () => {
          fireEvent(
            window,
            new MessageEvent("message", {
              data: {
                kind: MESSAGE_KIND.WINDOW_DIMENSION_CHANGE,
                data: {
                  bounds: {
                    height: 200,
                  },
                },
              },
              origin: "https://api.superapi.com.au",
            }),
          );

          // eslint-disable-next-line @typescript-eslint/unbound-method
          expect(loglevel.debug).toHaveBeenCalledWith(
            "Reacting to dimensions change of iFrame element, setting height to 200",
          );
        });

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

        it("sets the height of the iframe", () => {
          fireEvent(
            window,
            new MessageEvent("message", {
              data: {
                kind: MESSAGE_KIND.WINDOW_DIMENSION_CHANGE,
                data: {
                  bounds: {
                    height: 200,
                  },
                },
              },
              origin: "https://api.superapi.com.au",
            }),
          );

          const scope = within(element);
          const iframe = scope.getByTestId("iframe");
          expect(iframe).toHaveAttribute("height", "200px");
          expect(iframe).toHaveAttribute("width", "100%");
        });
      });
    });
  });

  describe("can provide additional origins", () => {
    beforeEach(() => {
      jest.clearAllMocks();

      element = window.document.createElement("div");

      embed = new Embed({
        element,
        extraAllowedOrigins: ["https://www.anotherorigin.com"],
        loaderClass: "theClass",
        url: "https://www.example.com/",
      });
    });

    it("logs incoming messages", () => {
      fireEvent(
        window,
        new MessageEvent("message", {
          data: {
            hello: "world",
          },
          origin: "https://www.anotherorigin.com",
        }),
      );

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(loglevel.info).toHaveBeenCalledWith(
        "Heard incoming message: undefined, with data: undefined",
      );
    });
  });

  describe("load error detection", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("calls onLoadError when iframe load completes but embed is never initialised", () => {
      const container = window.document.createElement("div");
      const onLoadError = jest.fn();

      const localEmbed = new Embed({
        element: container,
        loaderClass: "theClass",
        url: "https://www.example.com/",
        onLoadError,
      });

      const scope = within(container);
      const iframe = scope.getByTestId("iframe");

      // Simulate iframe load
      fireEvent.load(iframe);

      // Before the timeout fires, the callback must not have been called
      expect(onLoadError).not.toHaveBeenCalled();

      // Advance timers to trigger the 3 second timeout
      jest.advanceTimersByTime(3000);

      expect(onLoadError).toHaveBeenCalledTimes(1);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(loglevel.warn).toHaveBeenCalledWith(
        "Detected embed load failure, `onLoadError` callback will be fired if available",
      );

      // Sanity check that we never flagged the embed as successfully initialised
      expect(localEmbed.embedSuccessfullyInitialized).toBe(false);
    });

    it("does not call onLoadError when LOADED message is received before timeout", () => {
      const container = window.document.createElement("div");
      const onLoadError = jest.fn();

      const localEmbed = new Embed({
        element: container,
        loaderClass: "theClass",
        url: "https://www.example.com/",
        onLoadError,
      });

      const scope = within(container);
      const iframe = scope.getByTestId("iframe");

      // Simulate iframe load
      fireEvent.load(iframe);

      // Simulate the embed reporting that it has loaded correctly
      const data = {
        kind: MESSAGE_KIND.LOADED,
        data: null,
      };

      fireEvent(
        window,
        new MessageEvent("message", {
          data,
          origin: "https://api.superapi.com.au",
        }),
      );

      // At this point the flag should be set
      expect(localEmbed.embedSuccessfullyInitialized).toBe(true);

      // Advance timers past the 3 second window
      jest.advanceTimersByTime(3000);

      // onLoadError should never be called
      expect(onLoadError).not.toHaveBeenCalled();

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(loglevel.info).toHaveBeenCalledWith(
        "Detected successful embed load",
      );
    });
  });
});
