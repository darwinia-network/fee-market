import type { FeeMarketChain } from "./chain";

export interface Market {
  source: FeeMarketChain;
  destination: FeeMarketChain;
}
