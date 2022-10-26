import type { AccountId, Balance, Struct, BN } from "./polkadot";
import type { RelayerRole } from "./relayer";
import type { OrderEntity, SlashEntity, RelayerEntity } from "./entity";
import type { U8aFixed, u64, u128, Vec } from "@polkadot/types";
import type { AccountId32 } from "@polkadot/types/interfaces";

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

export interface PalletFeeMarketOrder extends Struct {
  readonly lane: U8aFixed;
  readonly message: u64;
  readonly lockedCollateral: u128;
  readonly relayers: Vec<PalletFeeMarketPriorRelayer>;
}

interface PalletFeeMarketPriorRelayer extends Struct {
  readonly id: AccountId32;
  readonly fee: u128;
}

export interface RelayerOrdersDataSource extends Pick<OrderEntity, "lane" | "nonce" | "createBlockTime"> {
  reward: BN;
  slash: BN;
  relayerRoles: RelayerRole[];
}

export interface SlashReward extends Pick<SlashEntity, "amount" | "relayerRole"> {
  order: Pick<OrderEntity, "lane" | "nonce" | "createBlockTime"> | null;
}

export enum UrlSearchParamsKey {
  FROM = "from",
  TO = "to",
  ID = "id",
  LANE = "lane",
  NONCE = "nonce",
}

export type OrdersData = Pick<
  OrderEntity,
  | "lane"
  | "nonce"
  | "sender"
  | "createBlockTime"
  | "finishBlockTime"
  | "createBlockNumber"
  | "finishBlockNumber"
  | "status"
  | "slotIndex"
> & {
  deliveryRelayers: { address: string }[];
  confirmationRelayers: { address: string }[];
};

export type OrderDetail = Pick<
  OrderEntity,
  | "lane"
  | "nonce"
  | "fee"
  | "sender"
  | "sourceTxHash"
  | "slotIndex"
  | "status"
  | "createBlockTime"
  | "finishBlockTime"
  | "createBlockNumber"
  | "finishBlockNumber"
  | "treasuryAmount"
  | "assignedRelayersAddress"
> & {
  slashes: (Pick<SlashEntity, "amount" | "relayerRole" | "blockNumber" | "extrinsicIndex" | "txHash"> & {
    relayer: Pick<RelayerEntity, "address">;
  })[];
  rewards: (Pick<SlashEntity, "amount" | "relayerRole" | "blockNumber" | "extrinsicIndex" | "txHash"> & {
    relayer: Pick<RelayerEntity, "address">;
  })[];
};
