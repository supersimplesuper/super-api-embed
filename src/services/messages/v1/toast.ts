import { MESSAGE_KIND } from "../../messages";

export type Kind = "success" | "error" | "info" | "warning";
export type Data = null;
export type Message = {
  data: {
    kind: Kind;
    message: string;
  };
  kind: MESSAGE_KIND.TOAST;
  version: "v1";
};
