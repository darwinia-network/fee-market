import { useCallback, useEffect, useState } from "react";
import { readContracts, readContract, writeContract, waitForTransaction } from "@wagmi/core";
import { useMarket } from "../../hooks/market";
import { getEthChainConfig, isEthChain } from "../../utils";
import { from, EMPTY, Subscription, zip, of } from "rxjs";
import { useTranslation } from "react-i18next";
import { notifyTx } from "./common";
import { OrderBook } from "../../types";

const getQuotePrev = async (contractAddress: `0x${string}`, contractInterface: [], relayer: string, quote = 0n) => {
  let prevOld: string | null = null;
  let prevNew: string | null = null;

  try {
    const relayerCount = (await readContract({
      address: contractAddress,
      abi: contractInterface,
      functionName: "relayerCount" as never,
    })) as bigint;
    const book = (await readContract({
      address: contractAddress,
      abi: contractInterface,
      functionName: "getOrderBook" as never,
      args: [relayerCount, true],
    })) as OrderBook<bigint>;

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

export const useEthRelayer = (relayerAddress: string, advanced: boolean) => {
  const { currentMarket } = useMarket();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [isRegistered, setRegistered] = useState(false);
  const [collateralAmount, setCollateralAmount] = useState(0n);
  const [currentLockedAmount, setCurrentLockedAmount] = useState(0n);
  const [currentQuoteAmount, setCurrentQuoteAmount] = useState(0n);

  const [minQuote, setMinQuote] = useState<bigint | null>(null);
  const [minCollateral, setMinCollateral] = useState<bigint | null>(null);

  const sourceChain = currentMarket?.source;

  const getRelayerInfo = useCallback(() => {
    if (advanced && isRegistered && isEthChain(sourceChain)) {
      setLoading(true);
      const { contractAddress, contractInterface } = getEthChainConfig(sourceChain);

      return from(
        readContracts({
          contracts: ["balanceOf", "lockedOf", "feeOf"].map((functionName) => ({
            address: contractAddress,
            abi: contractInterface as [],
            functionName,
            args: [relayerAddress],
          })),
        })
      ).subscribe({
        next: ([collateral, locked, quote]) => {
          if (collateral.status === "success" && locked.status === "success" && quote.status === "success") {
            setCollateralAmount(collateral.result as bigint);
            setCurrentLockedAmount(locked.result as bigint);
            setCurrentQuoteAmount(quote.result as bigint);
          }
          setLoading(false);
        },
        error: (error) => {
          setLoading(false);
          console.error("[collateral, locked, quote]:", error);
        },
      });
    }

    return EMPTY.subscribe();
  }, [relayerAddress, sourceChain, advanced, isRegistered]);

  const register = useCallback(
    async (
      quoteAmount: bigint,
      collateralAmount: bigint,
      onFailed: (error: Error) => void = () => undefined,
      onSuccess: () => void = () => undefined
    ) => {
      if (isEthChain(sourceChain)) {
        const { contractAddress, contractInterface, explorer } = getEthChainConfig(sourceChain);

        try {
          const { prevNew } = await getQuotePrev(contractAddress, contractInterface as [], relayerAddress, quoteAmount);
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
    [relayerAddress, sourceChain, t]
  );

  const cancel = useCallback(
    async (onFailed: (error: Error) => void = () => undefined, onSuccess: () => void = () => undefined) => {
      if (isEthChain(sourceChain)) {
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
            abi: contractInterface as [],
            functionName: "leave" as never,
            args: [prevOld],
            value: 0n,
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
    [relayerAddress, sourceChain, currentQuoteAmount, t]
  );

  const updateQuote = useCallback(
    async (
      amount: bigint,
      onFailed: (error: Error) => void = () => undefined,
      onSuccess: () => void = () => undefined
    ) => {
      if (isEthChain(sourceChain)) {
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
    [relayerAddress, sourceChain, t]
  );

  const updateCollateral = useCallback(
    async (
      amount: bigint,
      onFailed: (error: Error) => void = () => undefined,
      onSuccess: () => void = () => undefined
    ) => {
      if (isEthChain(sourceChain)) {
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
                abi: contractInterface as [],
                functionName: "withdraw" as never,
                args: [collateralAmount - amount],
                value: 0n,
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
    [sourceChain, collateralAmount, t]
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

    if (advanced && isEthChain(sourceChain)) {
      const { contractAddress, contractInterface } = getEthChainConfig(sourceChain);
      sub$$ = from(
        readContract({
          address: contractAddress,
          abi: contractInterface as [],
          functionName: "isRelayer" as never,
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
  }, [sourceChain, relayerAddress, advanced]);

  // Get minQuote and minCollateral
  useEffect(() => {
    let sub$$: Subscription;

    if (advanced && isEthChain(sourceChain)) {
      const { contractAddress, contractInterface } = getEthChainConfig(sourceChain);

      sub$$ = zip(
        of(0n),
        from(
          readContract({
            address: contractAddress,
            abi: contractInterface as [],
            functionName: "COLLATERAL_PER_ORDER" as never,
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
  }, [sourceChain, advanced]);

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
