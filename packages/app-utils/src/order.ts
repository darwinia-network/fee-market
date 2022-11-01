export const formatOrderId = (nonce: string) => {
  if (nonce.startsWith("0x")) {
    return `${nonce.slice(0, 4)}...${nonce.slice(-4)}`;
  }
  return `#${nonce}`;
};
