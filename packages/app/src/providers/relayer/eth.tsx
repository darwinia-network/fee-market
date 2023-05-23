import { useCallback, useEffect, useState } from "react";
import { writeContract, waitForTransaction } from "@wagmi/core";
import { useMarket } from "../../hooks/market";
import { getEthChainConfig, isEthChain, isEthersApi, isWalletClient, getQuotePrev, triggerContract } from "../../utils";
import { from, EMPTY, Subscription, zip, of, forkJoin } from "rxjs";
import { useTranslation } from "react-i18next";
import { notifyTx } from "./common";
import { useApi } from "../api";
import { BigNumber, Contract } from "ethers";
import { CallbackType } from "../../types";

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
    if (advanced && isRegistered && isEthChain(sourceChain) && isEthersApi(providerApi)) {
      setLoading(true);
      const chainConfig = getEthChainConfig(sourceChain);
      const contract = new Contract(chainConfig.contractAddress, chainConfig.contractInterface, providerApi);

      return forkJoin([
        from(contract.balanceOf(relayerAddress) as Promise<BigNumber>),
        from(contract.lockedOf(relayerAddress) as Promise<BigNumber>),
        from(contract.feeOf(relayerAddress) as Promise<BigNumber>),
      ]).subscribe({
        next: ([collateral, locked, quote]) => {
          setCollateralAmount(collateral.toBigInt());
          setCurrentLockedAmount(locked.toBigInt());
          setCurrentQuoteAmount(quote.toBigInt());
        },
        error: (error) => {
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
      onError: (error: Error) => void = () => undefined,
      onSuccess: () => void = () => undefined
    ) => {
      if (isEthChain(sourceChain) && isEthersApi(providerApi)) {
        const chainConfig = getEthChainConfig(sourceChain);

        const contract = new Contract(chainConfig.contractAddress, chainConfig.contractInterface, providerApi);
        const { prevNew } = await getQuotePrev(contract, relayerAddress, BigNumber.from(quoteAmount));

        if (isEthersApi(signerApi)) {
          const callback: CallbackType = {
            errorCallback: ({ error }) => {
              if (error instanceof Error) {
                notifyTx(t, {
                  type: "error",
                  msg: error.message,
                });
              } else {
                notifyTx(t, {
                  type: "error",
                  msg: t("Transaction sending failed"),
                });
              }
              onError(error as Error);
              console.error(error);
            },
            responseCallback: ({ response }) => {
              console.log(response);
            },
            successCallback: ({ receipt }) => {
              notifyTx(t, {
                type: "success",
                explorer: chainConfig.explorer.url,
                hash: receipt.transactionHash,
              });
              setRegistered(true);
              onSuccess();
            },
          };

          triggerContract(contract.connect(signerApi.getSigner()), "enroll", [prevNew, quoteAmount], callback, {
            value: collateralAmount.toString(),
          });
        } else if (isWalletClient(signerApi)) {
          try {
            const { hash } = await writeContract({
              address: chainConfig.contractAddress,
              abi: chainConfig.contractInterface as [],
              functionName: "enroll" as never,
              args: [prevNew, quoteAmount],
              value: collateralAmount,
            });
            const receipt = await waitForTransaction({ hash });
            if (receipt.status === "success") {
              notifyTx(t, {
                type: "success",
                explorer: chainConfig.explorer.url,
                hash: receipt.transactionHash,
              });
              setRegistered(true);
              onSuccess();
            } else {
              notifyTx(t, {
                type: "error",
                explorer: chainConfig.explorer.url,
                hash: receipt.transactionHash,
              });
              onError(new Error(receipt.status));
            }
          } catch (error) {
            notifyTx(t, { type: "error", msg: (error as Error).message });
            onError(error as Error);
            console.error(error);
          }
        }
      }
    },
    [relayerAddress, sourceChain, t, signerApi, providerApi]
  );

  const cancel = useCallback(
    async (onError: (error: Error) => void = () => undefined, onSuccess: () => void = () => undefined) => {
      if (isEthChain(sourceChain) && isEthersApi(providerApi)) {
        const chainConfig = getEthChainConfig(sourceChain);

        const contract = new Contract(chainConfig.contractAddress, chainConfig.contractInterface, providerApi);
        const { prevOld } = await getQuotePrev(contract, relayerAddress, BigNumber.from(currentQuoteAmount));

        if (isEthersApi(signerApi)) {
          const callback: CallbackType = {
            errorCallback: ({ error }) => {
              if (error instanceof Error) {
                notifyTx(t, {
                  type: "error",
                  msg: error.message,
                });
              } else {
                notifyTx(t, {
                  type: "error",
                  msg: t("Transaction sending failed"),
                });
              }
              onError(error as Error);
              console.error(error);
            },
            responseCallback: ({ response }) => {
              console.log(response);
            },
            successCallback: ({ receipt }) => {
              notifyTx(t, {
                type: "success",
                explorer: chainConfig.explorer.url,
                hash: receipt.transactionHash,
              });
              setRegistered(false);
              onSuccess();
            },
          };

          triggerContract(contract.connect(signerApi.getSigner()), "leave", [prevOld], callback);
        } else if (isWalletClient(signerApi)) {
          try {
            const { hash } = await writeContract({
              address: chainConfig.contractAddress,
              abi: chainConfig.contractInterface,
              functionName: "leave",
              args: [prevOld],
            });
            const receipt = await waitForTransaction({ hash });
            if (receipt.status === "success") {
              notifyTx(t, {
                type: "success",
                explorer: chainConfig.explorer.url,
                hash: receipt.transactionHash,
              });
              setRegistered(false);
              onSuccess();
            } else {
              notifyTx(t, {
                type: "error",
                explorer: chainConfig.explorer.url,
                hash: receipt.transactionHash,
              });
              onError(new Error(receipt.status));
            }
          } catch (error) {
            notifyTx(t, { type: "error", msg: (error as Error).message });
            onError(error as Error);
            console.error(error);
          }
        }
      }
    },
    [relayerAddress, sourceChain, currentQuoteAmount, t, signerApi, providerApi]
  );

  const updateQuote = useCallback(
    async (
      amount: bigint,
      onError: (error: Error) => void = () => undefined,
      onSuccess: () => void = () => undefined
    ) => {
      if (isEthChain(sourceChain) && isEthersApi(providerApi)) {
        const chainConfig = getEthChainConfig(sourceChain);

        const contract = new Contract(chainConfig.contractAddress, chainConfig.contractInterface, providerApi);
        const { prevOld, prevNew } = await getQuotePrev(contract, relayerAddress, BigNumber.from(amount));

        if (isEthersApi(signerApi)) {
          const callback: CallbackType = {
            errorCallback: ({ error }) => {
              if (error instanceof Error) {
                notifyTx(t, {
                  type: "error",
                  msg: error.message,
                });
              } else {
                notifyTx(t, {
                  type: "error",
                  msg: t("Transaction sending failed"),
                });
              }
              onError(error as Error);
              console.error(error);
            },
            responseCallback: ({ response }) => {
              console.log(response);
            },
            successCallback: ({ receipt }) => {
              notifyTx(t, {
                type: "success",
                explorer: chainConfig.explorer.url,
                hash: receipt.transactionHash,
              });
              onSuccess();
            },
          };

          triggerContract(contract.connect(signerApi.getSigner()), "move", [prevOld, prevNew, amount], callback);
        } else if (isWalletClient(signerApi)) {
          try {
            const { hash } = await writeContract({
              address: chainConfig.contractAddress,
              abi: chainConfig.contractInterface as [],
              functionName: "move" as never,
              args: [prevOld, prevNew, amount],
              value: 0n,
            });
            const receipt = await waitForTransaction({ hash });
            if (receipt.status === "success") {
              notifyTx(t, {
                type: "success",
                explorer: chainConfig.explorer.url,
                hash: receipt.transactionHash,
              });
              onSuccess();
            } else {
              notifyTx(t, {
                type: "error",
                explorer: chainConfig.explorer.url,
                hash: receipt.transactionHash,
              });
              onError(new Error(receipt.status));
            }
          } catch (error) {
            notifyTx(t, { type: "error", msg: (error as Error).message });
            onError(error as Error);
            console.error(error);
          }
        }
      }
    },
    [relayerAddress, sourceChain, t, signerApi, providerApi]
  );

  const updateCollateral = useCallback(
    async (
      amount: bigint,
      onError: (error: Error) => void = () => undefined,
      onSuccess: () => void = () => undefined
    ) => {
      if (isEthChain(sourceChain) && isEthersApi(providerApi)) {
        const chainConfig = getEthChainConfig(sourceChain);

        const contract = new Contract(chainConfig.contractAddress, chainConfig.contractInterface, providerApi);

        if (isEthersApi(signerApi)) {
          const callback: CallbackType = {
            errorCallback: ({ error }) => {
              if (error instanceof Error) {
                notifyTx(t, {
                  type: "error",
                  msg: error.message,
                });
              } else {
                notifyTx(t, {
                  type: "error",
                  msg: t("Transaction sending failed"),
                });
              }
              onError(error as Error);
              console.error(error);
            },
            responseCallback: ({ response }) => {
              console.log(response);
            },
            successCallback: ({ receipt }) => {
              notifyTx(t, {
                type: "success",
                explorer: chainConfig.explorer.url,
                hash: receipt.transactionHash,
              });
              onSuccess();
            },
          };

          if (amount > collateralAmount) {
            triggerContract(contract.connect(signerApi.getSigner()), "deposit", [], callback, {
              value: (amount - collateralAmount).toString(),
            });
          } else if (amount < collateralAmount) {
            triggerContract(contract.connect(signerApi.getSigner()), "withdraw", [collateralAmount - amount], callback);
          }
        } else if (isWalletClient(signerApi)) {
          try {
            let hash: `0x${string}` = "0x";
            if (amount > collateralAmount) {
              hash = (
                await writeContract({
                  address: chainConfig.contractAddress,
                  abi: chainConfig.contractInterface as [],
                  functionName: "deposit" as never,
                  args: [],
                  value: amount - collateralAmount,
                })
              ).hash;
            } else if (amount < collateralAmount) {
              hash = (
                await writeContract({
                  address: chainConfig.contractAddress,
                  abi: chainConfig.contractInterface,
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
                  explorer: chainConfig.explorer.url,
                  hash: receipt.transactionHash,
                });
                onSuccess();
              } else {
                notifyTx(t, {
                  type: "error",
                  explorer: chainConfig.explorer.url,
                  hash: receipt.transactionHash,
                });
                onError(new Error(receipt.status));
              }
            }
          } catch (error) {
            notifyTx(t, { type: "error", msg: (error as Error).message });
            onError(error as Error);
            console.error(error);
          }
        }
      }
    },
    [sourceChain, collateralAmount, t, signerApi, providerApi]
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

    if (advanced && isEthChain(sourceChain) && isEthersApi(providerApi)) {
      const chainConfig = getEthChainConfig(sourceChain);
      const contract = new Contract(chainConfig.contractAddress, chainConfig.contractInterface, providerApi);

      sub$$ = from(contract.isRelayer(relayerAddress) as Promise<boolean>).subscribe({
        next: setRegistered,
        error: (error) => {
          setRegistered(false);
          console.error(error);
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

    if (advanced && isEthChain(sourceChain) && isEthersApi(providerApi)) {
      const chainConfig = getEthChainConfig(sourceChain);
      const contract = new Contract(chainConfig.contractAddress, chainConfig.contractInterface, providerApi);

      sub$$ = zip(of(0n), from(contract.COLLATERAL_PER_ORDER() as Promise<BigNumber>)).subscribe({
        next: ([quote, collateral]) => {
          setMinQuote(quote);
          setMinCollateral(collateral.toBigInt());
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
