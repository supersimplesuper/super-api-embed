import { MESSAGE_KIND } from "../../messages";

export type Data = null;

export type Message = {
  data: Data;
  kind: MESSAGE_KIND.LOADED;
  version: "v1";
};
