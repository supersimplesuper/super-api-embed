import { MESSAGE_KIND } from "../../messages";

export type Data = null;

export type Message = {
  data: Data;
  kind: MESSAGE_KIND.PAGE_LOADED;
  version: "v1";
};
