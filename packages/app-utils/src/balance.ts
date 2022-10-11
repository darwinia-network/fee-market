import { providers, BigNumber } from "ethers";
import { ApiPromise } from "@polkadot/api";
import { u128, Struct, Vec, Enum } from "@polkadot/types";
import { bnMax, BN_ZERO, BN } from "@polkadot/util";

interface PalletBalancesReasons extends Enum {
  readonly isFee: boolean;
  readonly isMisc: boolean;
  readonly isAll: boolean;
  readonly type: "Fee" | "Misc" | "All";
}

interface PolkadotAccountData extends Struct {
  readonly free: u128;
}

interface PalletBalancesBalanceLock extends Struct {
  readonly amount: u128;
  readonly reasons: PalletBalancesReasons;
}

export interface BalanceResult<T> {
  total: T;
  available: T;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const calcMax = (lockItem: any, current: BN) => {
  let max = current;

  if (lockItem.reasons && !lockItem.reasons.isFee) {
    max = bnMax(lockItem.amount, max);
  } else if (lockItem.lockReasons && !lockItem.lockReasons.isFee) {
    if (lockItem.lockFor.isCommon) {
      max = bnMax(lockItem.lockFor.asCommon.amount, max);
    } else if (lockItem.lockFor.isStaking) {
      max = bnMax(lockItem.lockFor.asStaking.stakingAmount, max);
    }
  }

  return max;
};

export const getEthBalance = async (api: providers.Provider, addressOrName: string | Promise<string>) => {
  const balance = await api.getBalance(addressOrName);

  return { total: balance, available: balance } as BalanceResult<BigNumber>;
};

export const getPolkadotBalance = async (api: ApiPromise, address: string) => {
  const {
    data: { free },
  } = await (api.query.system.account(address) as unknown as Promise<{ data: PolkadotAccountData }>);
  const locks = await (api.query.balances.locks(address) as unknown as Promise<Vec<PalletBalancesBalanceLock>>);

  let maxLock = BN_ZERO;
  locks.forEach((item) => {
    maxLock = calcMax(item, maxLock);
  });

  const available = free.sub(maxLock);

  return { total: free, available } as BalanceResult<BN>;
};
