export type ABI = object[];

// [index, relayers, fees, collaterals, locks]

// https://github.com/darwinia-network/darwinia-messages-sol/blob/d52ec648e53d6ceecd9309b5e77e74255ceba81f/contracts/bridge/src/fee-market/SimpleFeeMarket.sol#L176
export type OrderBook = [bigint, string[], bigint[], bigint[], bigint[]];
