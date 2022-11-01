import type { Struct, U8aFixed, Vec, u64, u128 } from "@polkadot/types";
import type { AccountId32, AccountId, Balance } from "@polkadot/types/interfaces";

interface PalletFeeMarketPriorRelayer extends Struct {
  readonly id: AccountId32;
  readonly fee: u128;
}

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
