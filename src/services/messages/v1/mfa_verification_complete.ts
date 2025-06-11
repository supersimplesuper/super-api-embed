import { MESSAGE_KIND } from "../../messages"

export type Data = {
    verified_at: string | null;
    remote_id: string | null;
};

export type Message = {
    data: Data;
    kind: MESSAGE_KIND.MFA_VERIFICATION_COMPLETED;
    version: "v1";
};