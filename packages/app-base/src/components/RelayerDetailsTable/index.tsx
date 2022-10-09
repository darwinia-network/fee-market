import { Column, PaginationProps, Table } from "@darwinia/ui";
import localeKeys from "../../locale/localeKeys";
import { useTranslation } from "react-i18next";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { utils as ethersUtils } from "ethers";
import type { BN } from "@polkadot/util";
import type { RelayerOrdersDataSource } from "@feemarket/app-types";

const formatBalance = (amount: BN, symbol?: string | null, decimals?: number | null): string => {
  if (decimals) {
    return `${ethersUtils.commify(ethersUtils.formatUnits(amount.toString(), decimals))} ${symbol}`;
  }
  return "-";
};

interface Order {
  id: string;
  orderId: string;
  relayerRoles: string[];
  reward: string;
  slash: string;
  time: string;
}

interface Props {
  relatedOrdersData?: RelayerOrdersDataSource[];
  tokenSymbol?: string | null;
  tokenDecimals?: number | null;
}

const RelayerDetailsTable = ({ relatedOrdersData, tokenSymbol, tokenDecimals }: Props) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isLoading, setLoading] = useState(false);
  const columns: Column<Order>[] = [
    {
      id: "1",
      key: "orderId",
      title: <div className={"capitalize"}>#{t([localeKeys.orderId])}</div>,
      render: (row) => {
        return (
          <div
            onClick={() => {
              onOrderIdClicked(row);
            }}
            className={"clickable text-primary text-14-bold"}
          >
            #{row.orderId}
          </div>
        );
      },
      width: "10%",
    },
    {
      id: "2",
      key: "relayerRoles",
      title: <div className={"capitalize"}>{t([localeKeys.relayerRoles])}</div>,
      render: (row) => {
        return getRelayerRolesColumn(row);
      },
      width: "32%",
    },
    {
      id: "3",
      key: "reward",
      title: <div className={"capitalize"}>{t([localeKeys.reward])}</div>,
    },
    {
      id: "4",
      key: "slash",
      title: <div className={"capitalize"}>{t([localeKeys.slash])}</div>,
    },
    {
      id: "5",
      key: "time",
      title: <div className={"capitalize"}>{t([localeKeys.time])}</div>,
    },
  ];

  const onOrderIdClicked = (row: Order) => {
    console.log(row);
    // navigate()
  };

  const [dataSource, setDataSource] = useState<Order[]>([
    {
      id: "1",
      orderId: "924",
      relayerRoles: ["assigned", "confirmation"],
      slash: "89 RING",
      reward: "54 RING",
      time: "2022/08/26",
    },
    {
      id: "2",
      orderId: "999",
      relayerRoles: ["confirmation", "assigned", "delivery"],
      slash: "120 RING",
      reward: "88 RING",
      time: "2022/08/26",
    },
    {
      id: "3",
      orderId: "199",
      relayerRoles: ["assigned"],
      slash: "200 RING",
      reward: "13 RING",
      time: "2022/08/28",
    },
  ]);

  useEffect(() => {
    setDataSource(
      relatedOrdersData?.map((item, index) => {
        return {
          id: `${index}`,
          orderId: item.nonce,
          relayerRoles: item.relayerRoles,
          slash: formatBalance(item.slash, tokenSymbol, tokenDecimals),
          reward: formatBalance(item.reward, tokenSymbol, tokenDecimals),
          time: item.createBlockTime,
        };
      }) || []
    );
  }, [relatedOrdersData, tokenSymbol, tokenDecimals]);

  const onPageChange = useCallback((pageNumber: number) => {
    setTablePagination((oldValues) => {
      return {
        ...oldValues,
        currentPage: pageNumber,
      };
    });
    setLoading(true);
    // TODO this has to  be deleted
    setTimeout(() => {
      setLoading(false);
    }, 5000);
    console.log("page number changed=====", pageNumber);
  }, []);

  //TODO make sure the pageSize and totalPages are changed accordingly, refer the onPageChange method
  const [tablePagination, setTablePagination] = useState<PaginationProps>({
    currentPage: 1,
    pageSize: 10,
    totalPages: 1000,
    onChange: onPageChange,
  });

  const getTableTitle = () => {
    return <div className={"pb-[0.9375rem]"}>{t(localeKeys.relatedOrders)}</div>;
  };

  return (
    <Table
      isLoading={isLoading}
      headerSlot={getTableTitle()}
      minWidth={"1120px"}
      dataSource={dataSource}
      columns={columns}
      pagination={tablePagination}
    />
  );
};

const RoleOrderMapping: Record<string, number> = {
  Assigned: 0,
  Delivery: 1,
  Confirmation: 2,
};

const getRelayerRolesColumn = (row: Order) => {
  return (
    <div className={"flex-wrap flex flex-row gap-[0.625rem] text-12"}>
      {row.relayerRoles
        .sort((a, b) => RoleOrderMapping[a] - RoleOrderMapping[b])
        .map((role, index) => {
          const roleBg = role.toLowerCase() === "assigned" ? "bg-primary" : "";
          return (
            <div key={index} className={`${roleBg} border border-primary px-[0.8125rem] py-[0.21875rem]`}>
              {role}
            </div>
          );
        })}
    </div>
  );
};

export default RelayerDetailsTable;
