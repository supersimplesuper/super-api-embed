import { MESSAGE_KIND } from "../../messages";
import type { MessageV1 } from "./message";

export type Data = {
  current_step: string;
  steps: string[];
};

export type Message = MessageV1<MESSAGE_KIND.ONBOARDING_STEP_CHANGED, Data>;
