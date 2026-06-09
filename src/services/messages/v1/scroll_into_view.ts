import { MESSAGE_KIND } from "../../messages";
import type { MessageV1 } from "./message";

export type Data = {
  offsetTop: number;
};

export type Message = MessageV1<MESSAGE_KIND.SCROLL_INTO_VIEW, Data>;
