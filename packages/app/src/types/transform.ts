import type { OrderEntity, SlashEntity, RelayerEntity } from "./graphql";

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
