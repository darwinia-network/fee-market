import { BigNumber, providers } from "ethers";

export type ABI = object[];

// [index, relayers, fees, collaterals, locks]

// https://github.com/darwinia-network/darwinia-messages-sol/blob/d52ec648e53d6ceecd9309b5e77e74255ceba81f/contracts/bridge/src/fee-market/SimpleFeeMarket.sol#L176
export type OrderBook<T = BigNumber> = [T, string[], T[], T[], T[]];

export type ErrorCallbackType = ({ error }: { error: unknown }) => void;
export type ResponseCallbackType = ({ response }: { response: providers.TransactionResponse }) => void;
export type SuccessCallbackType = ({ receipt }: { receipt: providers.TransactionReceipt }) => void;

export type CallbackType = {
  errorCallback: ErrorCallbackType;
  responseCallback?: ResponseCallbackType;
  successCallback?: SuccessCallbackType;
};
