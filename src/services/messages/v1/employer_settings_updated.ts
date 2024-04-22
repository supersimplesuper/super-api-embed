import { MESSAGE_KIND } from "../../messages";

export type Data = null;
export type Message = {
  data: Data;
  kind: MESSAGE_KIND.EMPLOYER_SETTINGS_UPDATED;
  version: "v1";
};
