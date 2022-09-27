import type { FeeMarketApiSection, FeeMarketPolkadotChain } from "@feemarket/app-types";

export const MARKET_API_SECTIONS = {
  Crab: {
    Darwinia: ["feeMarket", "darwiniaFeeMarket"],
    "Crab Parachain": ["crabParachainFeeMarket"],
  },
  Darwinia: {
    Crab: ["feeMarket", "crabFeeMarket"],
  },
  Pangolin: {
    Pangoro: ["feeMarket", "pangoroFeeMarket"],
    "Pangolin Parachain": ["pangolinParachainFeeMarket"],
  },
  Pangoro: {
    Pangolin: ["feeMarket", "pangolinFeeMarket"],
  },
} as Record<FeeMarketPolkadotChain, Record<FeeMarketPolkadotChain, FeeMarketApiSection[]>>;
