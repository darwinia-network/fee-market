import { useApi } from "../../hooks/api";
import { useMarket } from "../../hooks/market";
import {
  getFeeMarketApiSection,
  isPolkadotApi,
  isPolkadotChain,
  isOption,
  getPolkadotChainConfig,
  signAndSendTx,
} from "../../utils";
import { useCallback, useEffect, useState } from "react";
import type { PalletFeeMarketRelayer, PalletFeeMarketOrder } from "../../types";
import { forkJoin, EMPTY, Subscription, from, zip, of } from "rxjs";
import type { u128 } from "@polkadot/types";
import type { Option } from "@polkadot/types";
import { notifyTx } from "./common";
import { useTranslation } from "react-i18next";
import { BN_ZERO } from "@polkadot/util";

export const usePolkadotRelayer = (relayerAddress: string, advanced: boolean) => {
  const { signerApi: api } = useApi();
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
  const destinationChain = currentMarket?.destination;

  const getRelayerInfo = useCallback(() => {
    if (advanced && isRegistered && isPolkadotChain(destinationChain) && isPolkadotApi(api)) {
      const apiSection = getFeeMarketApiSection(api, destinationChain);

      if (apiSection) {
        setLoading(true);

        return forkJoin([
          api.query[apiSection].relayersMap<PalletFeeMarketRelayer | Option<PalletFeeMarketRelayer>>(relayerAddress),
          api.query[apiSection].orders<Option<PalletFeeMarketOrder>>({}),
        ]).subscribe({
          next: ([relayer, order]) => {
            if (isOption(relayer)) {
              if (relayer.isSome) {
                const { collateral, fee, id } = relayer.unwrap();

                if (order.isSome) {
                  const { lockedCollateral, relayers } = order.unwrap();
                  const count = relayers.reduce(
                    (acc, cur) => (cur.id.toString().toLowerCase() === id.toString().toLowerCase() ? acc + 1 : acc),
                    0
                  );
                  setCurrentLockedAmount(BigInt(lockedCollateral.muln(count).toString()));
                }

                setCollateralAmount(BigInt(collateral.toString()));
                setCurrentQuoteAmount(BigInt(fee.toString()));
              }
            } else if (relayer) {
              const { collateral, fee, id } = relayer as PalletFeeMarketRelayer;

              if (order.isSome) {
                const { lockedCollateral, relayers } = order.unwrap();
                const count = relayers.reduce(
                  (acc, cur) => (cur.id.toString().toLowerCase() === id.toString().toLowerCase() ? acc + 1 : acc),
                  0
                );
                setCurrentLockedAmount(BigInt(lockedCollateral.muln(count).toString()));
              }

              setCollateralAmount(BigInt(collateral.toString()));
              setCurrentQuoteAmount(BigInt(fee.toString()));
            }
            setLoading(false);
          },
          error: (error) => {
            setLoading(false);
            console.error(error);
          },
        });
      }
      setCurrentLockedAmount(0n);
    }

    return EMPTY.subscribe();
  }, [relayerAddress, api, destinationChain, advanced, isRegistered]);

  const register = useCallback(
    async (
      quoteAmount: bigint,
      collateralAmount: bigint,
      onFailed: (error: Error) => void = () => undefined,
      onSuccess: () => void = () => undefined
    ) => {
      if (isPolkadotChain(sourceChain) && isPolkadotChain(destinationChain) && isPolkadotApi(api)) {
        const chainConfig = getPolkadotChainConfig(sourceChain);
        const apiSection = getFeeMarketApiSection(api, destinationChain);

        if (apiSection) {
          const extrinsic = api.tx[apiSection].enrollAndLockCollateral(
            collateralAmount.toString(),
            quoteAmount.toString()
          );

          signAndSendTx({
            extrinsic,
            requireAddress: relayerAddress,
            txSuccessCb: (result) => {
              notifyTx(t, {
                type: "success",
                explorer: chainConfig.explorer.url,
                hash: result.txHash.toHex(),
              });
              setRegistered(true);
              onSuccess();
            },
            txFailedCb: (error) => {
              if (error) {
                if (error instanceof Error) {
                  notifyTx(t, { type: "error", msg: error.message });
                } else {
                  notifyTx(t, { type: "error", explorer: chainConfig.explorer.url, hash: error.txHash.toHex() });
                }
              } else {
                notifyTx(t, { type: "error", msg: t("Transaction sending failed") });
              }
              onFailed(error as Error);
              console.error(error);
            },
          });
        }
      }
    },
    [sourceChain, destinationChain, api, t, relayerAddress]
  );

  const cancel = useCallback(
    async (onFailed: (error: Error) => void = () => undefined, onSuccess: () => void = () => undefined) => {
      if (isPolkadotChain(sourceChain) && isPolkadotChain(destinationChain) && isPolkadotApi(api)) {
        const chainConfig = getPolkadotChainConfig(sourceChain);
        const apiSection = getFeeMarketApiSection(api, destinationChain);

        if (apiSection) {
          const extrinsic = api.tx[apiSection].cancelEnrollment();

          signAndSendTx({
            extrinsic,
            requireAddress: relayerAddress,
            txSuccessCb: (result) => {
              notifyTx(t, {
                type: "success",
                explorer: chainConfig.explorer.url,
                hash: result.txHash.toHex(),
              });
              setRegistered(false);
              onSuccess();
            },
            txFailedCb: (error) => {
              if (error) {
                if (error instanceof Error) {
                  notifyTx(t, { type: "error", msg: error.message });
                } else {
                  notifyTx(t, { type: "error", explorer: chainConfig.explorer.url, hash: error.txHash.toHex() });
                }
              } else {
                notifyTx(t, { type: "error", msg: t("Transaction sending failed") });
              }
              onFailed(error as Error);
              console.error(error);
            },
          });
        }
      }
    },
    [sourceChain, destinationChain, api, relayerAddress, t]
  );

  const updateQuote = useCallback(
    (amount: bigint, onFailed: (error: Error) => void = () => undefined, onSuccess: () => void = () => undefined) => {
      if (isPolkadotChain(sourceChain) && isPolkadotChain(destinationChain) && isPolkadotApi(api)) {
        const chainConfig = getPolkadotChainConfig(sourceChain);
        const apiSection = getFeeMarketApiSection(api, destinationChain);

        if (apiSection) {
          const extrinsic = api.tx[apiSection].updateRelayFee(amount.toString());

          signAndSendTx({
            extrinsic,
            requireAddress: relayerAddress,
            txSuccessCb: (result) => {
              notifyTx(t, {
                type: "success",
                explorer: chainConfig.explorer.url,
                hash: result.txHash.toHex(),
              });
              onSuccess();
            },
            txFailedCb: (error) => {
              if (error) {
                if (error instanceof Error) {
                  notifyTx(t, { type: "error", msg: error.message });
                } else {
                  notifyTx(t, { type: "error", explorer: chainConfig.explorer.url, hash: error.txHash.toHex() });
                }
              } else {
                notifyTx(t, { type: "error", msg: t("Transaction sending failed") });
              }
              onFailed(error as Error);
              console.error(error);
            },
          });
        }
      }
    },
    [relayerAddress, api, sourceChain, destinationChain, t]
  );

  const updateCollateral = useCallback(
    (amount: bigint, onFailed: (error: Error) => void = () => undefined, onSuccess: () => void = () => undefined) => {
      if (isPolkadotChain(sourceChain) && isPolkadotChain(destinationChain) && isPolkadotApi(api)) {
        const chainConfig = getPolkadotChainConfig(sourceChain);
        const apiSection = getFeeMarketApiSection(api, destinationChain);

        if (apiSection) {
          const extrinsic = api.tx[apiSection].updateLockedCollateral(amount.toString());

          signAndSendTx({
            extrinsic,
            requireAddress: relayerAddress,
            txSuccessCb: (result) => {
              notifyTx(t, {
                type: "success",
                explorer: chainConfig.explorer.url,
                hash: result.txHash.toHex(),
              });
              onSuccess();
            },
            txFailedCb: (error) => {
              if (error) {
                if (error instanceof Error) {
                  notifyTx(t, { type: "error", msg: error.message });
                } else {
                  notifyTx(t, { type: "error", explorer: chainConfig.explorer.url, hash: error.txHash.toHex() });
                }
              } else {
                notifyTx(t, { type: "error", msg: t("Transaction sending failed") });
              }
              onFailed(error as Error);
              console.error(error);
            },
          });
        }
      }
    },
    [relayerAddress, api, sourceChain, destinationChain, t]
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

    if (advanced && isPolkadotApi(api) && isPolkadotChain(destinationChain)) {
      const apiSection = getFeeMarketApiSection(api, destinationChain);
      if (apiSection) {
        sub$$ = from(
          api.query[apiSection].relayersMap<PalletFeeMarketRelayer | Option<PalletFeeMarketRelayer>>(relayerAddress)
        ).subscribe({
          next: (res) => {
            if (isOption(res)) {
              if (res.isSome) {
                const { fee, collateral } = res.unwrap();
                if (fee.gt(BN_ZERO) || collateral.gt(BN_ZERO)) {
                  setRegistered(true);
                } else {
                  setRegistered(false);
                }
              } else {
                setRegistered(false);
              }
            } else if (
              res &&
              ((res as PalletFeeMarketRelayer).fee.gt(BN_ZERO) ||
                (res as PalletFeeMarketRelayer).collateral.gt(BN_ZERO))
            ) {
              setRegistered(true);
            } else {
              setRegistered(false);
            }
          },
          error: (error) => {
            setRegistered(false);
            console.error("check registered:", error);
          },
        });
      }
    }

    return () => {
      sub$$?.unsubscribe();
      setRegistered(false);
    };
  }, [api, destinationChain, relayerAddress, advanced]);

  // Get minQuote and minCollateral
  useEffect(() => {
    let sub$$: Subscription;

    if (advanced && isPolkadotChain(destinationChain) && isPolkadotApi(api)) {
      const apiSection = getFeeMarketApiSection(api, destinationChain);
      if (apiSection) {
        sub$$ = zip(
          of(api.consts[apiSection].minimumRelayFee as u128),
          of(api.consts[apiSection].collateralPerOrder as u128)
        ).subscribe({
          next: ([quote, collateral]) => {
            setMinQuote(BigInt(quote.toString()));
            setMinCollateral(BigInt(collateral.toString()));
          },
          error: (error) => {
            console.log("Get minQuote and minCollateral:", error);
          },
        });
      }
    }

    return () => {
      sub$$?.unsubscribe();
      setMinQuote(null);
      setMinCollateral(null);
    };
  }, [api, destinationChain, advanced]);

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
