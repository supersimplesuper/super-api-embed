import { MESSAGE_KIND } from "../../messages";

export type Data = {
  current_step: string;
  steps: string[];
};
export type Message = {
  data: Data;
  kind: MESSAGE_KIND.ONBOARDING_STEP_CHANGED;
  version: "v1";
};
