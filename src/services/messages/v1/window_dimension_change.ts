import { MESSAGE_KIND } from "../../messages";
import type { MessageV1 } from "./message";

export type Data = {
  bounds: DOMRect;
};

export type Message = MessageV1<MESSAGE_KIND.WINDOW_DIMENSION_CHANGE, Data>;
