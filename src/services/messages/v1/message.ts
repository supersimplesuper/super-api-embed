import type { MESSAGE_KIND } from "../../messages";

export type MessageV1<K extends MESSAGE_KIND, D> = {
  data: D;
  kind: K;
  version: "v1";
};
