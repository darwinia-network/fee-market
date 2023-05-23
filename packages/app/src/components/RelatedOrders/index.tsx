import { Column, PaginationProps, Table } from "@darwinia/ui";
import localeKeys from "../../locale/localeKeys";
import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMarket, useRelatedOrders } from "../../hooks";
import {
  formatBalance,
  unifyTime,
  formatTime,
  formatOrderId,
  formatUrlChainName,
  isEthChain,
  isPolkadotChain,
  getEthChainConfig,
  getPolkadotChainConfig,
} from "../../utils";
import { UrlSearchParamsKey } from "../../types";

const formatDateTime = (time: string) => `${formatTime(unifyTime(time))}`;

interface Order {
  id: string;
  lane: string;
  nonce: string;
  relayerRoles: string[];
  reward: string;
  slash: string;
  time: string;
}

const RelatedOrders = () => {
  const { t } = useTranslation();
  const { sourceChain, destinationChain } = useMarket();
  const { relatedOrders } = useRelatedOrders();
  const [dataSource, setDataSource] = useState<Order[]>([]);

  const nativeToken = useMemo(() => {
    if (isEthChain(sourceChain)) {
      return getEthChainConfig(sourceChain).nativeToken;
    } else if (isPolkadotChain(sourceChain)) {
      return getPolkadotChainConfig(sourceChain).nativeToken;
    }
    return null;
  }, [sourceChain]);

  const columns: Column<Order>[] = [
    {
      id: "1",
      key: "nonce",
      title: <div className={"capitalize"}>#{t([localeKeys.orderId])}</div>,
      render: (row) => {
        const urlSearchParams = new URLSearchParams();
        if (sourceChain && destinationChain) {
          urlSearchParams.set(UrlSearchParamsKey.FROM, formatUrlChainName(sourceChain));
          urlSearchParams.set(UrlSearchParamsKey.TO, formatUrlChainName(destinationChain));
        }
        urlSearchParams.set(UrlSearchParamsKey.LANE, row.lane);
        urlSearchParams.set(UrlSearchParamsKey.NONCE, row.nonce);
        const to = `/orders/details?${urlSearchParams.toString()}`;
        return (
          <Link to={to} className="clickable text-primary text-14-bold">
            {formatOrderId(row.nonce)}
          </Link>
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
      title: (
        <div className="flex items-center">
          <span className={"capitalize"}>{t([localeKeys.time])}</span>
          <span>&nbsp;</span>
          <span className="uppercase">(UTC+0)</span>
        </div>
      ),
      render: (row) => <span>{formatDateTime(row.time)}</span>,
    },
  ];

  //TODO make sure the pageSize and totalPages are changed accordingly, refer the onPageChange method
  const [tablePagination, setTablePagination] = useState<Omit<PaginationProps, "onChange">>({
    currentPage: 1,
    pageSize: 10,
    totalPages: relatedOrders.data?.length || 0,
  });

  useEffect(() => {
    const start = (tablePagination.currentPage - 1) * tablePagination.pageSize;
    const end = start + tablePagination.pageSize;

    setDataSource(
      relatedOrders.data?.slice(start, end)?.map((item, index) => {
        return {
          id: `${index}`,
          lane: item.lane,
          nonce: item.nonce,
          relayerRoles: item.relayerRoles,
          slash: nativeToken?.decimals ? formatBalance(item.slash, nativeToken.decimals, nativeToken.symbol) : "",
          reward: nativeToken?.decimals ? formatBalance(item.reward, nativeToken.decimals, nativeToken.symbol) : "",
          time: item.createBlockTime,
        };
      }) || []
    );
  }, [relatedOrders.data, nativeToken, tablePagination]);

  const getTableTitle = () => {
    return <div className={"pb-[0.9375rem]"}>{t(localeKeys.relatedOrders)}</div>;
  };

  return (
    <Table
      headerSlot={getTableTitle()}
      minWidth={"1120px"}
      dataSource={dataSource}
      columns={columns}
      pagination={tablePagination}
      onPageChange={(currentPage) => setTablePagination((prev) => ({ ...prev, currentPage }))}
      isLoading={relatedOrders.loading}
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
      {[...row.relayerRoles]
        .sort((a, b) => RoleOrderMapping[a] - RoleOrderMapping[b])
        .map((role, index) => {
          return (
            <div key={index} className={`rounded-2xl border border-primary px-[0.8125rem] py-[0.21875rem]`}>
              {role}
            </div>
          );
        })}
    </div>
  );
};

export default RelatedOrders;
