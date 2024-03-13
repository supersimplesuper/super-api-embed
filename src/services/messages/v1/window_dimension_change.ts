import { MESSAGE_KIND } from "../../messages";

export type Data = {
  bounds: DOMRect;
};

export type Message = {
  data: Data;
  kind: MESSAGE_KIND.WINDOW_DIMENSION_CHANGE;
  version: "v1";
};
