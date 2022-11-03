import { gql } from "@apollo/client";

export const MARKET_SUMMARY = gql`
  query feeMarketOverview($destination: String!) {
    market(id: $destination) {
      averageSpeed
      totalReward
      totalOrders
    }
  }
`;

export const ORDERS_COUNT_ETH_DATA = gql`
  query {
    orders(orderBy: createBlockNumber) {
      createBlockTime
    }
  }
`;

export const ORDERS_COUNT_POLKADOT_DATA = gql`
  query totalOrdersOverview($destination: String!) {
    orders(filter: { id: { startsWith: $destination } }, orderBy: CREATE_BLOCK_TIME_ASC) {
      nodes {
        createBlockTime
      }
    }
  }
`;

export const RELAYER_OVERVIEW_DATA = gql`
  query relayerOverview($relayerId: String!) {
    relayer(id: $relayerId) {
      totalOrders
      totalSlashes
      totalRewards
    }
  }
`;

export const ORDERS_SUMMARY_DATA = gql`
  query ordersStatistics($destination: String!) {
    market(id: $destination) {
      finishedOrders
      unfinishedInSlotOrders
      unfinishedOutOfSlotOrders
    }
  }
`;

export const ORDERS_OVERVIEW_ETH_DATA = gql`
  query {
    orders(orderBy: createBlockNumber) {
      lane
      nonce
      sender
      deliveryRelayers {
        deliveryRelayer {
          address
        }
      }
      confirmationRelayers {
        confirmationRelayer {
          address
        }
      }
      createBlockNumber
      finishBlockNumber
      createBlockTime
      finishBlockTime
      status
      slotIndex
    }
  }
`;

export const ORDERS_OVERVIEW_POLKADOT_DATA = gql`
  query ordersOverview($destination: String!) {
    orders(filter: { id: { startsWith: $destination } }, orderBy: CREATE_EVENT_INDEX_DESC) {
      nodes {
        lane
        nonce
        sender
        deliveryRelayers {
          nodes {
            deliveryRelayer {
              address
            }
          }
        }
        confirmationRelayers {
          nodes {
            confirmationRelayer {
              address
            }
          }
        }
        createBlockNumber
        finishBlockNumber
        createBlockTime
        finishBlockTime
        status
        slotIndex
      }
    }
  }
`;

export const ORDER_DETAIL_ETH_DATA = gql`
  query order($orderId: String!) {
    order(id: $orderId) {
      lane
      nonce
      fee
      sender
      sourceTxHash
      slotIndex
      status
      createBlockTime
      finishBlockTime
      createBlockNumber
      finishBlockNumber
      treasuryAmount
      assignedRelayersAddress
      slashes {
        amount
        relayerRole
        txHash
        relayer {
          address
        }
      }
      rewards {
        amount
        relayerRole
        txHash
        relayer {
          address
        }
      }
    }
  }
`;

export const ORDER_DETAIL_POLKADOT_DATA = gql`
  query orderDetail($orderId: String!) {
    order(id: $orderId) {
      lane
      nonce
      fee
      sender
      sourceTxHash
      slotTime
      outOfSlotBlock
      slotIndex
      status
      createBlockTime
      finishBlockTime
      createBlockNumber
      finishBlockNumber
      assignedRelayersAddress
      slashes {
        nodes {
          amount
          relayer {
            address
          }
          relayerRole
          blockNumber
          extrinsicIndex
        }
      }
      rewards {
        nodes {
          amount
          relayer {
            address
          }
          relayerRole
          blockNumber
          extrinsicIndex
        }
      }
      treasuryAmount
    }
  }
`;

export const RELAYER_REWARD_SLASH_ETH_DATA = gql`
  query ethRelayerRewardSlash($relayerId: String!) {
    relayer(id: $relayerId) {
      slashes {
        amount
        blockTime
      }
      rewards {
        amount
        blockTime
      }
    }
  }
`;

export const RELAYER_REWARD_SLASH_POLKADOT_DATA = gql`
  query polkadotRelayerRewardSlash($relayerId: String!) {
    relayer(id: $relayerId) {
      slashes {
        nodes {
          amount
          blockTime
        }
      }
      rewards {
        nodes {
          amount
          blockTime
        }
      }
    }
  }
`;

export const QUOTE_HISTORY_ETH_DATA = gql`
  query quoteHistory($relayerId: String!) {
    relayer(id: $relayerId) {
      quoteHistory {
        amount
        blockTime
      }
    }
  }
`;

export const QUOTE_HISTORY_POLKADOT_DATA = gql`
  query quoteHistory($relayerId: String!) {
    quoteHistory(id: $relayerId) {
      data
    }
  }
`;

export const RELAYER_ORDERS_ETH_DATA = gql`
  query relayerOrders($relayerId: String!) {
    relayer(id: $relayerId) {
      slashes {
        order {
          lane
          nonce
          createBlockTime
        }
        amount
        relayerRole
      }
      rewards {
        order {
          lane
          nonce
          createBlockTime
        }
        amount
        relayerRole
      }
    }
  }
`;

export const RELAYER_ORDERS_POLKADOT_DATA = gql`
  query relayerOrders($relayerId: String!) {
    relayer(id: $relayerId) {
      slashes {
        nodes {
          order {
            lane
            nonce
            createBlockTime
          }
          amount
          relayerRole
        }
      }
      rewards {
        nodes {
          order {
            lane
            nonce
            createBlockTime
          }
          amount
          relayerRole
        }
      }
    }
  }
`;

export const FEE_HISTORY_ETH_DATA = gql`
  query {
    feeHistories(orderBy: blockNumber) {
      amount
      blockTime
    }
  }
`;

export const FEE_HISTORY_POLKADOT_DATA = gql`
  query feeHistory($destination: String!) {
    feeHistory(id: $destination) {
      data
    }
  }
`;
