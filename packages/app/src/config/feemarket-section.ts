import type { FeeMarketPolkadotChain, FeeMarketApiSection } from "../types/chain";

/**
 * this is for Polkadot
 */
export const FEE_MARKET_API_SECTIONS = {
  // Crab: {
  //   Darwinia: ["feeMarket", "darwiniaFeeMarket"],
  //   "Crab Parachain": ["crabParachainFeeMarket"],
  // },
  // Darwinia: {
  //   Crab: ["feeMarket", "crabFeeMarket"],
  // },
  // Pangolin: {
  //   Pangoro: ["feeMarket", "pangoroFeeMarket"],
  //   "Pangolin Parachain": ["pangolinParachainFeeMarket"],
  // },
  // Pangoro: {
  //   Pangolin: ["feeMarket", "pangolinFeeMarket"],
  // },
  // "Crab Parachain": {
  //   Crab: ["crabFeeMarket"],
  // },
  // "Pangolin Parachain": {
  //   Pangolin: ["pangolinFeeMarket"],
  // },
} as Record<FeeMarketPolkadotChain, Record<FeeMarketPolkadotChain, FeeMarketApiSection[]>>;
