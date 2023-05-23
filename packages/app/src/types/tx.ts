import type { SubmittableResult } from "@polkadot/api";

export type TxCallback = (status: SubmittableResult) => void;
export type TxFailedCallback = (status: Error | SubmittableResult | null) => void;
