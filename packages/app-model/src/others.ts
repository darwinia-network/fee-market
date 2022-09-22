import type { AccountId, Balance, Struct, BN } from "./polkadot";
import type { RelayerRole } from "./relayer";
import type { OrderEntity, SlashEntity } from "./entity";

export type Page = "Overview" | "Relayers" | "Orders";
export type PagePath = Record<Page, Lowercase<Page>>;

export type FeeMarketApiSection =
  | "feeMarket"
  | "crabFeeMarket"
  | "darwiniaFeeMarket"
  | "pangolinFeeMarket"
  | "pangoroFeeMarket"
  | "crabParachainFeeMarket"
  | "pangolinParachainFeeMarket";

export interface PalletFeeMarketRelayer extends Struct {
  id: AccountId;
  collateral: Balance;
  fee: Balance;
}

export interface RelayerOrdersDataSource extends Pick<OrderEntity, "lane" | "nonce" | "createBlockTime"> {
  reward: BN;
  slash: BN;
  relayerRoles: RelayerRole[];
}

export interface SlashReward extends Pick<SlashEntity, "amount" | "relayerRole"> {
  order: Pick<OrderEntity, "lane" | "nonce" | "createBlockTime"> | null;
}
