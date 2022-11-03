import type { FeeMarketChain } from "@feemarket/config";

export interface Destination {
  id: FeeMarketChain;
  name: string;
}
export interface Network {
  id: FeeMarketChain;
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
