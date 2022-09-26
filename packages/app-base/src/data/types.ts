export interface Destination {
  id: string;
  name: string;
}
export interface Network {
  id: string;
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
