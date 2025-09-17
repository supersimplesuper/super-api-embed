import { MESSAGE_KIND } from "../../messages";

export type Data = {
  /**
   * A ISO 8601 compliant date time string indicating when the MFA session was
   * verified. This will be `null` when verifications attempts have been exceeded.
   */
  verified_at: string | null;
};

/**
 * A message type emitted when the user has either completed their MFA session or
 * have exceeded the maximum number of attempts. Successful attempts will have their
 * `verified_at` property as an ISO-8601 string, while failed attempts will be `null`.
 */
export type Message = {
  data: Data;
  kind: MESSAGE_KIND.MFA_VERIFICATION_COMPLETED;
  version: "v1";
};
