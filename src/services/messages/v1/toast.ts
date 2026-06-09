import { MESSAGE_KIND } from "../../messages";
import type { MessageV1 } from "./message";

export type Kind = "success" | "error" | "info" | "warning";
export type Data = null;
export type Message = MessageV1<
  MESSAGE_KIND.TOAST,
  {
    kind: Kind;
    message: string;
  }
>;
