import { MESSAGE_KIND } from "../../messages";

export type Data = {
  offsetTop: number;
};

export type Message = {
  data: Data;
  kind: MESSAGE_KIND.SCROLL_INTO_VIEW;
  version: "v1";
};
