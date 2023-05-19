export enum SlotIndex {
  OUT_OF_SLOT = -1,
  SLOT_1,
  SLOT_2,
  SLOT_3,
  SLOT_4,
  SLOT_5,
  SLOT_6,
}

export type OrderStatus = "Finished" | "InProgress";
export type RelayerRole = "Assigned" | "Delivery" | "Confirmation";

type AmountIndex = {
  amount: string;
  blockTime: string;
  blockNumber: number;
  extrinsicIndex: string | null;
  eventIndex: string;
};

export interface QuoteEntity {
  id: string;

  relayerId: string;
  data: AmountIndex[] | null;
}

export interface FeeEntity {
  id: string;

  marketId: string;
  data: AmountIndex[] | null;
  lastTime: number;
}

export interface RewardEntity {
  id: string;

  orderId: string;
  marketId: string;
  relayerId: string;

  blockTime: string;
  blockNumber: string;
  extrinsicIndex: number | null;
  eventIndex: string;
  txHash: string;

  amount: string;
  relayerRole: RelayerRole;
}

export interface SlashEntity {
  id: string;

  orderId: string;
  marketId: string;
  relayerId: string;

  blockTime: string;
  blockNumber: string;
  extrinsicIndex: number | null;
  eventIndex: string;
  txHash: string;

  amount: string;
  relayerRole: RelayerRole;

  sentTime: number;
  confirmTime: number;
  delayTime: number;
}

export interface MarketEntity {
  id: string;

  totalOrders: number | null;
  totalSlash: string | null;
  totalReward: string | null;

  averageSpeed: number | string | null;

  finishedOrders: number | null;
  unfinishedInSlotOrders: number | null;
  unfinishedOutOfSlotOrders: number | null;
}

export interface RelayerEntity {
  id: string;

  marketId: string;
  address: string;

  totalOrders: number;
  totalSlashes: string;
  totalRewards: string;
}

export interface OrderEntity {
  id: string;

  lane: string;
  nonce: string;
  marketId: string;

  sender: string | null;
  sourceTxHash: string | null;

  fee: string;
  status: OrderStatus;

  slotTime: number;
  outOfSlotBlock: number;
  slotIndex: SlotIndex | null;

  createBlockTime: string;
  createBlockNumber: number;
  createExtrinsicIndex: number | null;
  createEventIndex: number;

  finishBlockTime: string;
  finishBlockNumber: number;
  finishExtrinsicIndex: number | null;
  finishEventIndex: number;

  treasuryAmount: string | null;
  assignedRelayersAddress: string[];
}

export interface OrderRelayerEntity {
  id: string;

  assignedOrderId: string; // will deprecate
  deliveryOrderId: string; // will deprecate
  confirmationOrderId: string; // will deprecate

  assignedRelayerId: string; // will deprecate
  deliveryRelayerId: string; // will deprecate
  confirmationRelayerId: string; // will deprecate

  // next version

  // orderId: string;
  // relayerId: string;

  // relayerRole: RelayerRole;
}
