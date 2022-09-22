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
export type OrderStatusFilter = OrderStatus | "All";
