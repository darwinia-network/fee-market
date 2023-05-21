import { useCallback, useEffect, useState } from "react";
import { readContract, writeContract, waitForTransaction } from "@wagmi/core";
import { useMarket } from "../../hooks/market";
import { getEthChainConfig, isEthChain, isEthProviderApi, isEthSignerApi } from "../../utils";
import { from, EMPTY, Subscription, zip, of, forkJoin } from "rxjs";
import { useTranslation } from "react-i18next";
import { notifyTx } from "./common";
import { ABI, OrderBook } from "../../types";
import { useApi } from "../api";

const getQuotePrev = async (contractAddress: `0x${string}`, contractInterface: ABI, relayer: string, quote = 0n) => {
  let prevOld: string | null = null;
  let prevNew: string | null = null;

  try {
    const relayerCount = (await readContract({
      address: contractAddress,
      abi: contractInterface,
      functionName: "relayerCount",
    })) as bigint;
    const book = (await readContract({
      address: contractAddress,
      abi: contractInterface,
      functionName: "getOrderBook",
      args: [relayerCount, true],
    })) as OrderBook;

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
      const idx = book[2].findIndex((item) => quote < item);
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

export const useEth = (relayerAddress: string, advanced: boolean) => {
  const { sourceChain } = useMarket();
  const { providerApi, signerApi } = useApi();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [isRegistered, setRegistered] = useState(false);
  const [collateralAmount, setCollateralAmount] = useState(0n);
  const [currentLockedAmount, setCurrentLockedAmount] = useState(0n);
  const [currentQuoteAmount, setCurrentQuoteAmount] = useState(0n);

  const [minQuote, setMinQuote] = useState<bigint | null>(null);
  const [minCollateral, setMinCollateral] = useState<bigint | null>(null);

  const getRelayerInfo = useCallback(() => {
    if (advanced && isRegistered && isEthChain(sourceChain) && isEthProviderApi(providerApi)) {
      setLoading(true);
      const { contractAddress, contractInterface } = getEthChainConfig(sourceChain);

      const common = {
        address: contractAddress,
        abi: contractInterface,
        args: [relayerAddress],
      };

      return forkJoin(
        ["balanceOf", "lockedOf", "feeOf"].map(
          (functionName) => readContract({ ...common, functionName: functionName }) as Promise<bigint>
        )
      ).subscribe({
        next: ([collateral, locked, quote]) => {
          setCollateralAmount(collateral);
          setCurrentLockedAmount(locked);
          setCurrentQuoteAmount(quote);
          setLoading(false);
        },
        error: (error) => {
          setLoading(false);
          console.error("[collateral, locked, quote]:", error);
        },
      });
    }

    return EMPTY.subscribe();
  }, [relayerAddress, sourceChain, advanced, isRegistered, providerApi]);

  const register = useCallback(
    async (
      quoteAmount: bigint,
      collateralAmount: bigint,
      onFailed: (error: Error) => void = () => undefined,
      onSuccess: () => void = () => undefined
    ) => {
      if (isEthChain(sourceChain) && isEthSignerApi(signerApi)) {
        const { contractAddress, contractInterface, explorer } = getEthChainConfig(sourceChain);

        try {
          const { prevNew } = await getQuotePrev(contractAddress, contractInterface, relayerAddress, quoteAmount);
          const { hash } = await writeContract({
            address: contractAddress,
            abi: contractInterface as [],
            functionName: "enroll" as never,
            args: [prevNew, quoteAmount],
            value: collateralAmount,
          });
          const receipt = await waitForTransaction({ hash });
          if (receipt.status === "success") {
            notifyTx(t, {
              type: "success",
              explorer: explorer.url,
              hash: receipt.transactionHash,
            });
            setRegistered(true);
            onSuccess();
          } else {
            notifyTx(t, {
              type: "error",
              explorer: explorer.url,
              hash: receipt.transactionHash,
            });
            onFailed(new Error(receipt.status));
          }
        } catch (error) {
          notifyTx(t, { type: "error", msg: (error as Error).message });
          onFailed(error as Error);
          console.error(error);
        }
      }
    },
    [relayerAddress, sourceChain, t, signerApi]
  );

  const cancel = useCallback(
    async (onFailed: (error: Error) => void = () => undefined, onSuccess: () => void = () => undefined) => {
      if (isEthChain(sourceChain) && isEthSignerApi(signerApi)) {
        const { contractAddress, contractInterface, explorer } = getEthChainConfig(sourceChain);

        try {
          const { prevOld } = await getQuotePrev(
            contractAddress,
            contractInterface as [],
            relayerAddress,
            currentQuoteAmount
          );
          const { hash } = await writeContract({
            address: contractAddress,
            abi: contractInterface,
            functionName: "leave",
            args: [prevOld],
          });
          const receipt = await waitForTransaction({ hash });
          if (receipt.status === "success") {
            notifyTx(t, {
              type: "success",
              explorer: explorer.url,
              hash: receipt.transactionHash,
            });
            setRegistered(false);
            onSuccess();
          } else {
            notifyTx(t, {
              type: "error",
              explorer: explorer.url,
              hash: receipt.transactionHash,
            });
            onFailed(new Error(receipt.status));
          }
        } catch (error) {
          notifyTx(t, { type: "error", msg: (error as Error).message });
          onFailed(error as Error);
          console.error(error);
        }
      }
    },
    [relayerAddress, sourceChain, currentQuoteAmount, t, signerApi]
  );

  const updateQuote = useCallback(
    async (
      amount: bigint,
      onFailed: (error: Error) => void = () => undefined,
      onSuccess: () => void = () => undefined
    ) => {
      if (isEthChain(sourceChain) && isEthSignerApi(signerApi)) {
        const { contractAddress, contractInterface, explorer } = getEthChainConfig(sourceChain);
        try {
          const { prevOld, prevNew } = await getQuotePrev(
            contractAddress,
            contractInterface as [],
            relayerAddress,
            amount
          );
          const { hash } = await writeContract({
            address: contractAddress,
            abi: contractInterface as [],
            functionName: "move" as never,
            args: [prevOld, prevNew, amount],
            value: 0n,
          });
          const receipt = await waitForTransaction({ hash });
          if (receipt.status === "success") {
            notifyTx(t, {
              type: "success",
              explorer: explorer.url,
              hash: receipt.transactionHash,
            });
            onSuccess();
          } else {
            notifyTx(t, {
              type: "error",
              explorer: explorer.url,
              hash: receipt.transactionHash,
            });
            onFailed(new Error(receipt.status));
          }
        } catch (error) {
          notifyTx(t, { type: "error", msg: (error as Error).message });
          onFailed(error as Error);
          console.error(error);
        }
      }
    },
    [relayerAddress, sourceChain, t, signerApi]
  );

  const updateCollateral = useCallback(
    async (
      amount: bigint,
      onFailed: (error: Error) => void = () => undefined,
      onSuccess: () => void = () => undefined
    ) => {
      if (isEthChain(sourceChain) && isEthSignerApi(signerApi)) {
        const { contractAddress, contractInterface, explorer } = getEthChainConfig(sourceChain);
        try {
          let hash: `0x${string}` = "0x";
          if (amount > collateralAmount) {
            hash = (
              await writeContract({
                address: contractAddress,
                abi: contractInterface as [],
                functionName: "deposit" as never,
                args: [],
                value: amount - collateralAmount,
              })
            ).hash;
          } else if (amount < collateralAmount) {
            hash = (
              await writeContract({
                address: contractAddress,
                abi: contractInterface,
                functionName: "withdraw",
                args: [collateralAmount - amount],
              })
            ).hash;
          }
          if (hash !== "0x") {
            const receipt = await waitForTransaction({ hash });
            if (receipt.status === "success") {
              notifyTx(t, {
                type: "success",
                explorer: explorer.url,
                hash: receipt.transactionHash,
              });
              onSuccess();
            } else {
              notifyTx(t, {
                type: "error",
                explorer: explorer.url,
                hash: receipt.transactionHash,
              });
              onFailed(new Error(receipt.status));
            }
          }
        } catch (error) {
          notifyTx(t, { type: "error", msg: (error as Error).message });
          onFailed(error as Error);
          console.error(error);
        }
      }
    },
    [sourceChain, collateralAmount, t, signerApi]
  );

  useEffect(() => {
    const sub$$ = getRelayerInfo();
    return () => {
      sub$$.unsubscribe();
      setLoading(false);
      setCollateralAmount(0n);
      setCurrentLockedAmount(0n);
      setCurrentQuoteAmount(0n);
    };
  }, [getRelayerInfo]);

  // Check registered
  useEffect(() => {
    let sub$$: Subscription;

    if (advanced && isEthChain(sourceChain) && isEthProviderApi(providerApi)) {
      const { contractAddress, contractInterface } = getEthChainConfig(sourceChain);
      sub$$ = from(
        readContract({
          address: contractAddress,
          abi: contractInterface,
          functionName: "isRelayer",
          args: [relayerAddress],
        })
      ).subscribe({
        next: (value) => {
          setRegistered(value as boolean);
        },
        error: (error) => {
          setRegistered(false);
          console.error("check registered:", error);
        },
      });
    }

    return () => {
      sub$$?.unsubscribe();
      setRegistered(false);
    };
  }, [sourceChain, relayerAddress, advanced, providerApi]);

  // Get minQuote and minCollateral
  useEffect(() => {
    let sub$$: Subscription;

    if (advanced && isEthChain(sourceChain) && isEthProviderApi(providerApi)) {
      const { contractAddress, contractInterface } = getEthChainConfig(sourceChain);

      sub$$ = zip(
        of(0n),
        from(
          readContract({
            address: contractAddress,
            abi: contractInterface,
            functionName: "COLLATERAL_PER_ORDER",
          }) as Promise<bigint>
        )
      ).subscribe({
        next: ([quote, collateral]) => {
          setMinQuote(quote);
          setMinCollateral(collateral);
        },
        error: (error) => {
          console.log("Get minQuote and minCollateral:", error);
        },
      });
    }

    return () => {
      sub$$?.unsubscribe();
      setMinQuote(null);
      setMinCollateral(null);
    };
  }, [sourceChain, advanced, providerApi]);

  return {
    loading,
    isRegistered,
    collateralAmount,
    currentLockedAmount,
    currentQuoteAmount,
    minQuote,
    minCollateral,
    register,
    cancel,
    getRelayerInfo,
    updateQuote,
    updateCollateral,
  };
};
