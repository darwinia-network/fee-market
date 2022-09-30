import type { FeeMarketPolkadotChain } from "@feemarket/app-types";

export interface Destination {
  id: FeeMarketPolkadotChain;
  name: string;
}
export interface Network {
  id: FeeMarketPolkadotChain;
  name: string;
  logo: string;
  destinations: Destination[];
}

export interface NetworkOption {
  liveNets: Network[];
  testNets: Network[];
}

export interface MenuItem {
  id: string;
  icon?: string;
  text: string;
  children?: MenuItem[];
  path?: string;
}
