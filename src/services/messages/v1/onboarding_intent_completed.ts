import { MESSAGE_KIND } from "../../messages";

export type Data = null;

export type Message = {
  data: Data;
  kind: MESSAGE_KIND.ONBOARDING_INTENT_COMPLETED;
  version: "v1";
};
