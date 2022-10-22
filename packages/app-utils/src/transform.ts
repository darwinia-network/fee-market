import { compareAsc, compareDesc, addDays } from "./date-fns";
import { bnToBn } from "./polkadot";
import { formatUnits } from "./ethers";
import { BN_ZERO, POLKADOT_PRECISION } from "@feemarket/app-config";
import {
  BN,
  RelayerRole,
  RelayerOrdersDataSource,
  OrderEntity,
  FeeEntity,
  SlashEntity,
  RewardEntity,
  SlashReward,
  QuoteEntity,
} from "@feemarket/app-types";

export const transformRelayerRewardSlash = (data: {
  relayer: {
    slashes: { nodes: Pick<SlashEntity, "amount" | "blockTime">[] } | null;
    rewards: { nodes: Pick<RewardEntity, "amount" | "blockTime">[] } | null;
  } | null;
}): { rewards: [number, number][]; slashs: [number, number][] } => {
  const slashes =
    data.relayer?.slashes?.nodes.reduce((acc, cur) => {
      const date = `${cur.blockTime.split("T")[0]}Z`;
      acc[date] = (acc[date] || BN_ZERO).add(bnToBn(cur.amount));
      return acc;
    }, {} as Record<string, BN>) || {};

  const rewards =
    data.relayer?.rewards?.nodes.reduce((acc, cur) => {
      const date = `${cur.blockTime.split("T")[0]}Z`;
      acc[date] = (acc[date] || BN_ZERO).add(bnToBn(cur.amount));
      return acc;
    }, {} as Record<string, BN>) || {};

  const combineDates = Array.from(
    Object.keys(rewards)
      .concat(Object.keys(slashes))
      .reduce((dates, date) => {
        return dates.add(date);
      }, new Set<string>())
  ).sort((a, b) => compareAsc(new Date(a), new Date(b)));

  if (combineDates.length) {
    const end = new Date(`${new Date().toISOString().split("T")[0]}Z`);

    for (let cur = new Date(combineDates[0]); compareAsc(cur, end) <= 0; cur = addDays(cur, 1)) {
      const date = `${cur.toISOString().split("T")[0]}Z`;
      if (!combineDates.some((item) => item === date)) {
        combineDates.push(date);
      }
    }
  }

  return {
    rewards: combineDates.map((date) => [
      new Date(date).getTime(),
      rewards[date] ? Number(formatUnits(rewards[date].toString(), POLKADOT_PRECISION)) : 0,
    ]),
    slashs: combineDates.map((date) => [
      new Date(date).getTime(),
      slashes[date] ? Number(formatUnits(slashes[date].toString(), POLKADOT_PRECISION)) : 0,
    ]),
  };
};

// eslint-disable-next-line complexity
export const transformRelayerQuotes = (data: {
  quoteHistory: Pick<QuoteEntity, "data"> | null;
}): [number, number][] => {
  const datesValues =
    (data.quoteHistory?.data || []).reduce((acc, cur) => {
      const date = `${cur.blockTime.split("T")[0]}Z`;
      acc[date] = (acc[date] || new BN(cur.amount)).add(new BN(cur.amount)).divn(2); // eslint-disable-line no-magic-numbers
      return acc;
    }, {} as Record<string, BN>) || {};

  const dates = Object.keys(datesValues).sort((a, b) => compareAsc(new Date(a), new Date(b)));
  if (dates.length > 1) {
    const end = new Date(`${new Date().toISOString().split("T")[0]}Z`);
    for (let cur = new Date(dates[0]); compareAsc(cur, end) < 0; cur = addDays(cur, 1)) {
      const next = addDays(cur, 1);
      const dateCur = `${cur.toISOString().split("T")[0]}Z`;
      const dateNext = `${next.toISOString().split("T")[0]}Z`;
      if (!datesValues[dateNext]) {
        datesValues[dateNext] = datesValues[dateCur];
      }
    }
  }

  return Object.keys(datesValues)
    .sort((a, b) => compareAsc(new Date(a), new Date(b)))
    .map((date) => [new Date(date).getTime(), Number(formatUnits(datesValues[date].toString(), POLKADOT_PRECISION))]);
};

const reduceSlashReward = (
  previous: RelayerOrdersDataSource[],
  current: SlashReward,
  isSlash: boolean
): RelayerOrdersDataSource[] => {
  const idx = previous.findIndex((item) => item.lane === current.order?.lane && item.nonce === current.order.nonce);

  const row: RelayerOrdersDataSource =
    idx >= 0
      ? previous[idx]
      : {
          lane: current.order?.lane as string,
          nonce: current.order?.nonce as string,
          createBlockTime: current.order?.createBlockTime as string,
          reward: BN_ZERO,
          slash: BN_ZERO,
          relayerRoles: [] as RelayerRole[],
        };

  const roles = new Set<RelayerRole>(row.relayerRoles);
  row.relayerRoles = Array.from(roles.add(current.relayerRole));

  if (isSlash) {
    row.slash = row.slash.add(bnToBn(current.amount));
  } else {
    row.reward = row.reward.add(bnToBn(current.amount));
  }

  previous.splice(idx, idx === -1 ? 0 : 1, row);
  return previous;
};

export const transformRelayerOrders = (data: {
  relayer?: {
    slashes: {
      nodes: (Pick<SlashEntity, "amount" | "relayerRole"> & {
        order: Pick<OrderEntity, "lane" | "nonce" | "createBlockTime"> | null;
      })[];
    } | null;
    rewards: {
      nodes: (Pick<SlashEntity, "amount" | "relayerRole"> & {
        order: Pick<OrderEntity, "lane" | "nonce" | "createBlockTime"> | null;
      })[];
    } | null;
  } | null;
}): RelayerOrdersDataSource[] => {
  let dataSource: RelayerOrdersDataSource[] = [];

  dataSource =
    data.relayer?.rewards?.nodes.reduce((acc, cur) => reduceSlashReward(acc, cur, false), dataSource) || dataSource;
  dataSource =
    data.relayer?.slashes?.nodes.reduce((acc, cur) => reduceSlashReward(acc, cur, true), dataSource) || dataSource;

  return dataSource.sort((a, b) => compareDesc(new Date(a.createBlockTime), new Date(b.createBlockTime)));
};

export const transformTotalOrdersOverview = (data: {
  orders: { nodes: Pick<OrderEntity, "createBlockTime">[] } | null;
}): [number, number][] => {
  const datesOrders =
    data.orders?.nodes.reduce((acc, { createBlockTime }) => {
      const date = `${createBlockTime.split("T")[0]}Z`;
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

  const dates = Object.keys(datesOrders).sort((a, b) => compareAsc(new Date(a), new Date(b)));
  if (dates.length) {
    const end = new Date(`${new Date().toISOString().split("T")[0]}Z`);

    for (let cur = new Date(dates[0]); compareAsc(cur, end) <= 0; cur = addDays(cur, 1)) {
      const date = `${cur.toISOString().split("T")[0]}Z`;
      if (!datesOrders[date]) {
        datesOrders[date] = 0;
      }
    }
  }

  return Object.keys(datesOrders)
    .sort((a, b) => compareAsc(new Date(a), new Date(b)))
    .map((date) => [new Date(date).getTime(), datesOrders[date]]);
};

export const transformFeeHistory = (data: { feeHistory: Pick<FeeEntity, "data"> | null }): [number, number][] => {
  const datesValues =
    data.feeHistory?.data?.reduce((acc, cur) => {
      const date = `${cur.blockTime.split("T")[0]}Z`;
      acc[date] = (acc[date] || new BN(cur.amount)).add(new BN(cur.amount)).divn(2); // eslint-disable-line no-magic-numbers
      return acc;
    }, {} as Record<string, BN>) || {};

  return Object.keys(datesValues).map((date) => [
    new Date(date).getTime(),
    Number(formatUnits(datesValues[date].toString(), POLKADOT_PRECISION)),
  ]);
};
