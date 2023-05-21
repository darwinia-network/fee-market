import { PropsWithChildren, createContext } from "react";
import { Subscription, EMPTY } from "rxjs";
import { useEth } from "./eth";
import { usePolkadot } from "./polkadot";
import { useMarket } from "../../hooks/market";
import { isPolkadotChain } from "../../utils";

export interface RelayerCtx {
  relayerAddress: string;
  loading: boolean;
  isRegistered: boolean;
  collateralAmount: bigint;
  currentLockedAmount: bigint;
  currentQuoteAmount: bigint;
  minQuote: bigint | null;
  minCollateral: bigint | null;
  register: (
    quoteAmount: bigint,
    collateralAmount: bigint,
    onFailed: (error: Error) => void,
    onSuccess: () => void
  ) => Promise<void>;
  cancel: (onFailed: (error: Error) => void, onSuccess: () => void) => Promise<void>;
  getRelayerInfo: () => Subscription;
  updateQuote: (amount: bigint, onFailed: (error: Error) => void, onSuccess: () => void) => void;
  updateCollateral: (amount: bigint, onFailed: (error: Error) => void, onSuccess: () => void) => void;
}

const defaultValue: RelayerCtx = {
  relayerAddress: "",
  loading: false,
  isRegistered: false,
  collateralAmount: 0n,
  currentLockedAmount: 0n,
  currentQuoteAmount: 0n,
  minQuote: null,
  minCollateral: null,
  register: async () => undefined,
  cancel: async () => undefined,
  updateQuote: async () => undefined,
  updateCollateral: async () => undefined,
  getRelayerInfo: () => EMPTY.subscribe(),
};

export const RelayerContext = createContext<RelayerCtx>(defaultValue);

export const RelayerProvider = ({
  children,
  relayerAddress,
  advanced,
}: PropsWithChildren<{ relayerAddress: string; advanced?: boolean }>) => {
  const { sourceChain } = useMarket();

  const eth = useEth(relayerAddress, !!advanced);
  const polkadot = usePolkadot(relayerAddress, !!advanced);

  return (
    <RelayerContext.Provider
      value={isPolkadotChain(sourceChain) ? { ...polkadot, relayerAddress } : { ...eth, relayerAddress }}
    >
      {children}
    </RelayerContext.Provider>
  );
};
