import { isEthApi } from "./api";

export const formatOrderId = (nonce: string) => {
  if (nonce.startsWith("0x")) {
    return `${nonce.slice(0, 4)}...${nonce.slice(-4)}`;
  }
  return `#${nonce}`;
};

export const adaptSlotIndex = (api: unknown, slot: number) => {
  // for eth "slot === 1" means "Slot #1", but for polkadot "slot === 0" means "Slot #1"
  // here we convert to polkadot format
  if (isEthApi(api) && slot > 0) {
    return slot - 1;
  }
  return slot;
};
