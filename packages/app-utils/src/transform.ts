import { compareAsc, compareDesc, addDays } from "./date-fns";
import { bnToBn } from "./polkadot";
import { BN_ZERO } from "@feemarket/app-config";
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
  OrdersData,
  RelayerEntity,
  OrderDetail,
} from "@feemarket/app-types";
import { adaptTime } from "./others";
import { isSubQueryEntities, isTheGraphEntities } from "./entity";

export const transformEthRelayerRewardSlash = (data: {
  relayer: {
    slashes: Pick<SlashEntity, "amount" | "blockTime">[] | null;
    rewards: Pick<RewardEntity, "amount" | "blockTime">[] | null;
  } | null;
}): { rewards: [number, BN][]; slashs: [number, BN][] } => {
  const slashes = data.relayer?.slashes?.length
    ? data.relayer?.slashes.reduce((acc, cur) => {
        const time = new Date(adaptTime(cur.blockTime)).toISOString();
        const date = `${time.split("T")[0]}T00:00:00Z`;
        acc[date] = (acc[date] || BN_ZERO).add(bnToBn(cur.amount));
        return acc;
      }, {} as Record<string, BN>)
    : {};

  const rewards = data.relayer?.rewards?.length
    ? data.relayer?.rewards.reduce((acc, cur) => {
        const time = new Date(adaptTime(cur.blockTime)).toISOString();
        const date = `${time.split("T")[0]}T00:00:00Z`;
        acc[date] = (acc[date] || BN_ZERO).add(bnToBn(cur.amount));
        return acc;
      }, {} as Record<string, BN>)
    : {};

  const combineDates = Array.from(
    Object.keys(rewards)
      .concat(Object.keys(slashes))
      .reduce((dates, date) => {
        return dates.add(date);
      }, new Set<string>())
  ).sort((a, b) => compareAsc(adaptTime(a), adaptTime(b)));

  if (combineDates.length) {
    const end = new Date(`${new Date().toISOString().split("T")[0]}T00:00:00Z`);

    for (let cur = new Date(adaptTime(combineDates[0])); compareAsc(cur, end) <= 0; cur = addDays(cur, 1)) {
      const date = `${cur.toISOString().split("T")[0]}T00:00:00Z`;
      if (!combineDates.some((item) => item === date)) {
        combineDates.push(date);
      }
    }
  }

  return {
    rewards: combineDates.map((date) => [new Date(date).getTime(), rewards[date] ? rewards[date] : BN_ZERO]),
    slashs: combineDates.map((date) => [new Date(date).getTime(), slashes[date] ? slashes[date] : BN_ZERO]),
  };
};

export const transformPolkadotRelayerRewardSlash = (data: {
  relayer: {
    slashes: { nodes: Pick<SlashEntity, "amount" | "blockTime">[] } | null;
    rewards: { nodes: Pick<RewardEntity, "amount" | "blockTime">[] } | null;
  } | null;
}): { rewards: [number, BN][]; slashs: [number, BN][] } => {
  const slashes = data.relayer?.slashes?.nodes?.length
    ? data.relayer?.slashes?.nodes.reduce((acc, cur) => {
        const date = `${cur.blockTime.split("T")[0]}T00:00:00Z`;
        acc[date] = (acc[date] || BN_ZERO).add(bnToBn(cur.amount));
        return acc;
      }, {} as Record<string, BN>)
    : {};

  const rewards = data.relayer?.rewards?.nodes?.length
    ? data.relayer?.rewards?.nodes.reduce((acc, cur) => {
        const date = `${cur.blockTime.split("T")[0]}T00:00:00Z`;
        acc[date] = (acc[date] || BN_ZERO).add(bnToBn(cur.amount));
        return acc;
      }, {} as Record<string, BN>)
    : {};

  const combineDates = Array.from(
    Object.keys(rewards)
      .concat(Object.keys(slashes))
      .reduce((dates, date) => {
        return dates.add(date);
      }, new Set<string>())
  ).sort((a, b) => compareAsc(new Date(a), new Date(b)));

  if (combineDates.length) {
    const end = new Date(`${new Date().toISOString().split("T")[0]}T00:00:00Z`);

    for (let cur = new Date(combineDates[0]); compareAsc(cur, end) <= 0; cur = addDays(cur, 1)) {
      const date = `${cur.toISOString().split("T")[0]}T00:00:00Z`;
      if (!combineDates.some((item) => item === date)) {
        combineDates.push(date);
      }
    }
  }

  return {
    rewards: combineDates.map((date) => [new Date(date).getTime(), rewards[date] ? rewards[date] : BN_ZERO]),
    slashs: combineDates.map((date) => [new Date(date).getTime(), slashes[date] ? slashes[date] : BN_ZERO]),
  };
};

export const transformEthRelayerQuotes = (data: {
  relayer: {
    quoteHistory: {
      amount: string;
      blockTime: string;
    }[];
  } | null;
}): [number, BN][] => {
  const datesValues =
    (data.relayer?.quoteHistory || []).reduce((acc, cur) => {
      const time = new Date(adaptTime(cur.blockTime)).toISOString();
      const date = `${time.split("T")[0]}T00:00:00Z`;
      acc[date] = (acc[date] || new BN(cur.amount)).add(new BN(cur.amount)).divn(2); // eslint-disable-line no-magic-numbers
      return acc;
    }, {} as Record<string, BN>) || {};

  const dates = Object.keys(datesValues).sort((a, b) => compareAsc(new Date(a), new Date(b)));
  if (dates.length) {
    const end = new Date(`${new Date().toISOString().split("T")[0]}T00:00:00Z`);
    for (let cur = new Date(dates[0]); compareAsc(cur, end) < 0; cur = addDays(cur, 1)) {
      const next = addDays(cur, 1);
      const dateCur = `${cur.toISOString().split("T")[0]}T00:00:00Z`;
      const dateNext = `${next.toISOString().split("T")[0]}T00:00:00Z`;
      if (!datesValues[dateNext]) {
        datesValues[dateNext] = datesValues[dateCur];
      }
    }
  }

  return Object.keys(datesValues)
    .sort((a, b) => compareAsc(new Date(a), new Date(b)))
    .map((date) => [new Date(date).getTime(), datesValues[date]]);
};

// eslint-disable-next-line complexity
export const transformPolkadotRelayerQuotes = (data: {
  quoteHistory: Pick<QuoteEntity, "data"> | null;
}): [number, BN][] => {
  const datesValues =
    (data.quoteHistory?.data || []).reduce((acc, cur) => {
      const date = `${cur.blockTime.split("T")[0]}T00:00:00Z`;
      acc[date] = (acc[date] || new BN(cur.amount)).add(new BN(cur.amount)).divn(2); // eslint-disable-line no-magic-numbers
      return acc;
    }, {} as Record<string, BN>) || {};

  const dates = Object.keys(datesValues).sort((a, b) => compareAsc(new Date(a), new Date(b)));
  if (dates.length) {
    const end = new Date(`${new Date().toISOString().split("T")[0]}T00:00:00Z`);
    for (let cur = new Date(dates[0]); compareAsc(cur, end) < 0; cur = addDays(cur, 1)) {
      const next = addDays(cur, 1);
      const dateCur = `${cur.toISOString().split("T")[0]}T00:00:00Z`;
      const dateNext = `${next.toISOString().split("T")[0]}T00:00:00Z`;
      if (!datesValues[dateNext]) {
        datesValues[dateNext] = datesValues[dateCur];
      }
    }
  }

  return Object.keys(datesValues)
    .sort((a, b) => compareAsc(new Date(a), new Date(b)))
    .map((date) => [new Date(date).getTime(), datesValues[date]]);
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

export const transformEthRelayerOrders = (data: {
  relayer?: {
    slashes:
      | (Pick<SlashEntity, "amount" | "relayerRole"> & {
          order: Pick<OrderEntity, "lane" | "nonce" | "createBlockTime"> | null;
        })[]
      | null;
    rewards:
      | (Pick<SlashEntity, "amount" | "relayerRole"> & {
          order: Pick<OrderEntity, "lane" | "nonce" | "createBlockTime"> | null;
        })[]
      | null;
  } | null;
}): RelayerOrdersDataSource[] => {
  let dataSource: RelayerOrdersDataSource[] = [];

  dataSource = data.relayer?.rewards?.length
    ? data.relayer?.rewards.reduce((acc, cur) => reduceSlashReward(acc, cur, false), dataSource)
    : dataSource;
  dataSource = data.relayer?.slashes?.length
    ? data.relayer?.slashes.reduce((acc, cur) => reduceSlashReward(acc, cur, true), dataSource)
    : dataSource;

  return dataSource.sort((a, b) => compareDesc(adaptTime(a.createBlockTime), adaptTime(b.createBlockTime)));
};

export const transformPolkadotRelayerOrders = (data: {
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

  dataSource = data.relayer?.rewards?.nodes?.length
    ? data.relayer?.rewards?.nodes.reduce((acc, cur) => reduceSlashReward(acc, cur, false), dataSource)
    : dataSource;
  dataSource = data.relayer?.slashes?.nodes?.length
    ? data.relayer?.slashes?.nodes.reduce((acc, cur) => reduceSlashReward(acc, cur, true), dataSource)
    : dataSource;

  return dataSource.sort((a, b) => compareDesc(new Date(a.createBlockTime), new Date(b.createBlockTime)));
};

export const transformTotalOrdersOverview = (data: {
  orders: { nodes: Pick<OrderEntity, "createBlockTime">[] } | Pick<OrderEntity, "createBlockTime">[] | null;
}): [number, number][] => {
  const entities = isTheGraphEntities<Pick<OrderEntity, "createBlockTime">>(data.orders)
    ? data.orders
    : isSubQueryEntities<Pick<OrderEntity, "createBlockTime">>(data.orders)
    ? data.orders.nodes
    : [];

  const datesOrders =
    entities.reduce((acc, { createBlockTime }) => {
      const time = Number.isNaN(Number(createBlockTime))
        ? createBlockTime
        : new Date(Number(createBlockTime) * 1000).toISOString();
      const date = `${time.split("T")[0]}T00:00:00Z`;
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

  const dates = Object.keys(datesOrders).sort((a, b) => compareAsc(new Date(a), new Date(b)));
  if (dates.length) {
    const end = new Date(`${new Date().toISOString().split("T")[0]}T00:00:00Z`);

    for (let cur = new Date(dates[0]); compareAsc(cur, end) <= 0; cur = addDays(cur, 1)) {
      const date = `${cur.toISOString().split("T")[0]}T00:00:00Z`;
      if (!datesOrders[date]) {
        datesOrders[date] = 0;
      }
    }
  }

  return Object.keys(datesOrders)
    .sort((a, b) => compareAsc(new Date(a), new Date(b)))
    .map((date) => [new Date(date).getTime(), datesOrders[date]]);
};

export const transformFeeHistory = (data: {
  feeHistory?: Pick<FeeEntity, "data"> | null;
  feeHistories?: { amount: string; blockTime: string }[];
}): [number, BN][] => {
  const entities = data.feeHistory?.data ?? data.feeHistories ?? [];
  const datesValues =
    entities.reduce((acc, cur) => {
      const time = new Date(adaptTime(cur.blockTime)).toISOString();
      const date = `${time.split("T")[0]}T00:00:00Z`;
      acc[date] = (acc[date] || new BN(cur.amount)).add(new BN(cur.amount)).divn(2); // eslint-disable-line no-magic-numbers
      return acc;
    }, {} as Record<string, BN>) || {};

  return Object.keys(datesValues).map((date) => [new Date(date).getTime(), datesValues[date]]);
};

export const transformEthOrdersData = (data: {
  orders: (Pick<
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
    deliveryRelayers: { deliveryRelayer: Pick<RelayerEntity, "address"> }[] | null;
    confirmationRelayers: { confirmationRelayer: Pick<RelayerEntity, "address"> }[] | null;
  })[];
}): OrdersData[] => {
  return data.orders.map((item) => ({
    ...item,
    deliveryRelayers: item.deliveryRelayers?.map((item) => ({ address: item.deliveryRelayer.address })) || [],
    confirmationRelayers:
      item.confirmationRelayers?.map((item) => ({ address: item.confirmationRelayer.address })) || [],
  }));
};

export const transformPolkadotOrdersData = (data: {
  orders: {
    nodes: (Pick<
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
      deliveryRelayers: { nodes: { deliveryRelayer: Pick<RelayerEntity, "address"> }[] } | null;
      confirmationRelayers: { nodes: { confirmationRelayer: Pick<RelayerEntity, "address"> }[] } | null;
    })[];
  } | null;
}): OrdersData[] => {
  return (
    data.orders?.nodes.map((item) => ({
      ...item,
      deliveryRelayers: item.deliveryRelayers?.nodes.map((item) => ({ address: item.deliveryRelayer.address })) || [],
      confirmationRelayers:
        item.confirmationRelayers?.nodes.map((item) => ({ address: item.confirmationRelayer.address })) || [],
    })) || []
  );
};

export const transformEthOrderDetail = (data: {
  order:
    | (Pick<
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
        slashes: (Pick<SlashEntity, "amount" | "relayerRole" | "blockNumber" | "txHash"> & {
          relayer: Pick<RelayerEntity, "address">;
        })[];
        rewards: (Pick<RewardEntity, "amount" | "relayerRole" | "blockNumber" | "txHash"> & {
          relayer: Pick<RelayerEntity, "address">;
        })[];
      })
    | null;
}): OrderDetail | null => {
  return data.order
    ? {
        ...data.order,
        slashes: data.order.slashes.map((item) => ({ ...item, extrinsicIndex: 0 })),
        rewards: data.order.rewards.map((item) => ({ ...item, extrinsicIndex: 0 })),
      }
    : null;
};

export const transformPolkadotOrderDetail = (data: {
  order:
    | (Pick<
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
        slashes: {
          nodes: (Pick<SlashEntity, "amount" | "relayerRole" | "blockNumber" | "extrinsicIndex"> & {
            relayer: Pick<RelayerEntity, "address">;
          })[];
        } | null;
        rewards: {
          nodes: (Pick<RewardEntity, "amount" | "relayerRole" | "blockNumber" | "extrinsicIndex"> & {
            relayer: Pick<RelayerEntity, "address">;
          })[];
        } | null;
      })
    | null;
}): OrderDetail | null => {
  return data.order
    ? {
        ...data.order,
        slashes: data.order.slashes?.nodes.map((item) => ({ ...item, txHash: "" })) || [],
        rewards: data.order.rewards?.nodes.map((item) => ({ ...item, txHash: "" })) || [],
      }
    : null;
};
