import { providers, Contract, BigNumber } from "ethers";
import type { OrderBook } from "../types";

export type ErrorCallbackType = ({ error }: { error: unknown }) => void;
export type ResponseCallbackType = ({ response }: { response: providers.TransactionResponse }) => void;
export type SuccessCallbackType = ({ receipt }: { receipt: providers.TransactionReceipt }) => void;

export type CallbackType = {
  errorCallback: ErrorCallbackType;
  responseCallback?: ResponseCallbackType;
  successCallback?: SuccessCallbackType;
};

interface Overrides {
  value: string; // the amount of ether (in wei) to forward with the call
}

export const triggerContract = async (
  contract: Contract,
  methodName: string,
  contractArgs: unknown[] = [],
  callback: CallbackType = { errorCallback: () => undefined },
  overrides?: Overrides
) => {
  const { errorCallback, responseCallback, successCallback } = callback;

  try {
    const response: providers.TransactionResponse = overrides
      ? await contract[methodName](...contractArgs, overrides)
      : await contract[methodName](...contractArgs);

    if (responseCallback) {
      responseCallback({ response });
    }

    const receipt: providers.TransactionReceipt = await response.wait(2);

    if (receipt.byzantium && receipt.status === 1 && successCallback) {
      successCallback({ receipt });
    }
  } catch (error) {
    console.error("[triggerContract]", error);
    errorCallback({ error });
  }
};

export const getQuotePrev = async (contract: Contract, relayer: string, quote: BigNumber = BigNumber.from(0)) => {
  let prevOld: string | null = null;
  let prevNew: string | null = null;

  try {
    const relayerCount = await (await (contract.relayerCount() as Promise<BigNumber>)).toNumber();
    const book = await (contract.getOrderBook(relayerCount, true) as Promise<OrderBook>);

    const sentinelHead = "0x0000000000000000000000000000000000000001";

    {
      const idx = book[1].findIndex((item) => item.toLowerCase() === relayer.toLowerCase());
      if (idx > 0) {
        prevOld = book[1][idx - 1];
      } else if (idx === 0) {
        prevOld = sentinelHead;
      }
    }

    {
      const idx = book[2].findIndex((item) => quote.lt(item));
      if (idx === 0) {
        prevNew = sentinelHead;
      } else if (idx < 0) {
        prevNew = book[1][book[1].length - 1];
      } else {
        prevNew = book[1][idx - 1];
      }

      if (prevNew.toLowerCase() === relayer.toLowerCase()) {
        prevNew = prevOld;
      }
    }
  } catch (error) {
    console.error("Get quote prev:", error);
  }

  return { prevOld, prevNew };
};
