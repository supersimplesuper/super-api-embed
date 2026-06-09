import { MESSAGE_KIND } from "../../messages";
import type { MessageV1 } from "./message";

export type Data = null;

export type Message = MessageV1<MESSAGE_KIND.EMPLOYER_SETTINGS_UPDATED, Data>;
