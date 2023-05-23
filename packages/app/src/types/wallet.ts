export type WalletID = "metamask" | "polkadot-js" | "wallet-connect";

export interface Wallet {
  id: WalletID;
  logo: string;
  name: string;
  installed: boolean;
  loading: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}
