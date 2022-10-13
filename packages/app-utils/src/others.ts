import { MARKET_API_SECTIONS, ETH_SENTINEL_HEAD } from "@feemarket/app-config";
import { providers, BigNumberish, utils as ethersUtils, Contract, BigNumber } from "ethers";
import { ApiPromise } from "@polkadot/api";
import type { BN } from "@polkadot/util";
import { ALL_FEE_MARKET_ETH_CHAINS, ALL_FEE_MARKET_POLKADOT_CHAINS } from "@feemarket/app-types";
import type {
  FeeMarketApiSection,
  FeeMarketEthChain,
  FeeMarketPolkadotChain,
  RuntimeVersion,
} from "@feemarket/app-types";

export const getQuotePrev = async (contract: Contract, relayer: string, quote: BigNumber = BigNumber.from(0)) => {
  let prevOld: string | null = null;
  let prevNew: string | null = null;

  type OrderBook = [BigNumber, string[], BigNumber[], BigNumber[], BigNumber[]];

  try {
    const books: OrderBook[] = [];
    const relayerCount = await (await (contract.relayerCount() as Promise<BigNumber>)).toNumber();

    for (let i = 1; i <= relayerCount; i++) {
      books.push(await (contract.getOrderBook(i, true) as Promise<OrderBook>));
    }

    const indexNew = books.findIndex((item) => quote.gt(item[2][0]));
    const oldIndex = books.findIndex((item) => item[1].some((item) => item.toLowerCase() === relayer.toLowerCase()));

    if (oldIndex > 0) {
      prevOld = books[oldIndex - 1][1][0];
    } else if (oldIndex === 0) {
      prevOld = ETH_SENTINEL_HEAD;
    } else {
      prevOld = null;
    }
    prevNew = indexNew >= 0 ? books[indexNew][1][0] : ETH_SENTINEL_HEAD;
  } catch (error) {
    console.error("Get quote prev:", error);
  }

  return { prevOld, prevNew };
};

export const getFeeMarketApiSection = (
  api: ApiPromise,
  destination: FeeMarketPolkadotChain
): FeeMarketApiSection | null => {
  const { specName } = api.consts.system.version as RuntimeVersion;
  const source = specName.toString() as FeeMarketPolkadotChain;

  if (MARKET_API_SECTIONS[source] && MARKET_API_SECTIONS[source][destination]) {
    const sections = MARKET_API_SECTIONS[source][destination];
    for (const section of sections) {
      if (api.consts[section] && api.query[section]) {
        return section;
      }
    }
  }

  return null;
};

export const getPolkadotMarkets = () => {
  const markets = {} as Record<FeeMarketPolkadotChain, FeeMarketPolkadotChain[]>;

  const sources = Object.keys(MARKET_API_SECTIONS) as FeeMarketPolkadotChain[];
  for (const source of sources) {
    markets[source] = Object.keys(MARKET_API_SECTIONS[source]) as FeeMarketPolkadotChain[];
  }

  return markets;
};

export const isEthApi = (api: unknown): api is providers.Web3Provider => {
  return api instanceof providers.Web3Provider;
};

export const isPolkadotApi = (api: unknown): api is ApiPromise => {
  return api instanceof ApiPromise;
};

export const isEthChain = (chainName: unknown): chainName is FeeMarketEthChain => {
  return ALL_FEE_MARKET_ETH_CHAINS.includes(chainName as FeeMarketEthChain);
};

export const isPolkadotChain = (chainName: unknown): chainName is FeeMarketPolkadotChain => {
  return ALL_FEE_MARKET_POLKADOT_CHAINS.includes(chainName as FeeMarketPolkadotChain);
};

export const formatBalance = (
  amount: BigNumberish | BN | null | undefined,
  decimals: number | null | undefined,
  symbol?: string | null,
  overrides?: { precision?: number }
): string => {
  if ((amount || amount === 0) && decimals) {
    const precision = overrides?.precision;
    const [integer, decimal] = ethersUtils.formatUnits(amount.toString(), decimals).split(".");
    const balance = `${integer}.${precision ? decimal.slice(0, precision) : decimal}`;
    return symbol ? `${balance} ${symbol}` : balance;
  }
  return "-";
};

export const formatShortAddress = (address: string): string => {
  return `${address.slice(0, 4)}...${address.slice(-6)}`;
};
